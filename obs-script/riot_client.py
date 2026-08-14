import ssl
import json
import time
import hashlib
import urllib.request
import urllib.error

class StateDiffer:
    def __init__(self, heartbeat_interval_seconds=5.0):
        self.last_hash = None
        self.last_send_time = 0
        self.heartbeat_interval = heartbeat_interval_seconds

    def compute_hash(self, state_payload):
        if not state_payload:
            return ""
        # Copy without timestamp for content comparison
        copy_obj = dict(state_payload)
        copy_obj.pop("timestamp", None)
        serialized = json.dumps(copy_obj, sort_keys=True)
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

    def has_changed(self, state_payload, current_time=None):
        if current_time is None:
            current_time = time.time()

        curr_hash = self.compute_hash(state_payload)
        
        # Check if hash changed or heartbeat expired
        if curr_hash != self.last_hash or (current_time - self.last_send_time) >= self.heartbeat_interval:
            self.last_hash = curr_hash
            self.last_send_time = current_time
            return True
        return False

def get_adaptive_interval_ms(state_payload):
    if not state_payload or state_payload.get("status") != "active":
        return 2000 # Standby / out of game

    combat = state_payload.get("combat", [])
    if combat and len(combat) > 0:
        return 500 # High frequency during active combat

    return 1000 # Normal planning / shop phase


class RiotLiveClient:
    def __init__(self, endpoint="https://127.0.0.1:2999", timeout_seconds=1.5):
        self.endpoint = endpoint.rstrip("/")
        self.timeout = timeout_seconds
        
        self.ssl_context = ssl.create_default_context()
        self.ssl_context.check_hostname = False
        self.ssl_context.verify_mode = ssl.CERT_NONE

    def fetch_raw_data(self):
        url = f"{self.endpoint}/liveclientdata/allgamedata"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "TFT-Twitch-Relay/1.0", "Accept": "application/json"}
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout, context=self.ssl_context) as res:
                if res.status == 200:
                    body = res.read().decode("utf-8")
                    return json.loads(body)
        except (urllib.error.URLError, TimeoutError, ConnectionResetError, json.JSONDecodeError):
            return None
        return None

    def normalize_game_state(self, raw_data):
        if not raw_data or "activePlayer" not in raw_data:
            return {"status": "standby", "timestamp": int(time.time())}

        active_player = raw_data.get("activePlayer", {})
        summoner_name = active_player.get("summonerName", "")
        level = active_player.get("level", 1)
        gold = active_player.get("currentGold", 0)
        
        champ_stats = active_player.get("championStats", {})
        health = int(champ_stats.get("currentHealth", 100))

        # Find matching player in allPlayers
        all_players = raw_data.get("allPlayers", [])
        matched_player = None
        for p in all_players:
            if p.get("summonerName") == summoner_name or (summoner_name and summoner_name.startswith(p.get("summonerName", "@#$"))):
                matched_player = p
                break
        
        streak = 0
        raw_items = []
        raw_champions = []
        raw_traits = []

        if matched_player:
            streak = matched_player.get("streak", 0)
            raw_items = matched_player.get("items", [])
            raw_champions = matched_player.get("champions", [])
            raw_traits = matched_player.get("traits", [])

        # Extract bench / inventory items
        bench_items = []
        if "itemData" in raw_data and isinstance(raw_data["itemData"], list):
            for item in raw_data["itemData"]:
                name = item.get("name") or item.get("rawItemName") or ""
                if name:
                    bench_items.append(name)
        elif raw_items:
            for item in raw_items:
                if isinstance(item, dict):
                    name = item.get("rawItemName") or item.get("name") or str(item.get("itemID", ""))
                    if name:
                        bench_items.append(name)
                elif isinstance(item, str):
                    bench_items.append(item)

        # Extract board champions
        board_units = []
        for champ in raw_champions:
            c_name = champ.get("name") or champ.get("rawChampionName") or champ.get("championName", "")
            if not c_name:
                continue
            stars = int(champ.get("starLevel", champ.get("stars", 1)))
            items_list = []
            for item in champ.get("items", []):
                if isinstance(item, dict):
                    item_name = item.get("rawItemName") or item.get("name") or str(item.get("itemID", ""))
                    if item_name:
                        items_list.append(item_name)
                elif isinstance(item, str):
                    items_list.append(item)

            board_units.append({
                "champion": c_name,
                "stars": stars,
                "items": items_list
            })

        # Extract trait synergies
        active_traits = []
        for t in raw_traits:
            t_name = t.get("name") or t.get("rawTraitName") or ""
            count = int(t.get("numUnits", t.get("count", 0)))
            tier = int(t.get("style", t.get("tier", 0)))
            if t_name and count > 0:
                active_traits.append({
                    "key": t_name,
                    "count": count,
                    "tier": tier
                })

        active_traits.sort(key=lambda tr: (tr["tier"], tr["count"]), reverse=True)

        # Extract combat stats
        combat_metrics = []
        raw_combat = raw_data.get("combatStats", [])
        if isinstance(raw_combat, list):
            for c in raw_combat:
                c_name = c.get("champion") or c.get("name", "")
                if c_name:
                    combat_metrics.append({
                        "champion": c_name,
                        "damage": int(c.get("damage", 0)),
                        "taken": int(c.get("taken", 0)),
                        "healShield": int(c.get("healShield", c.get("healing", 0)))
                    })

        return {
            "status": "active",
            "timestamp": int(time.time()),
            "player": {
                "name": summoner_name,
                "level": level,
                "gold": gold,
                "health": health,
                "streak": streak
            },
            "bench": bench_items,
            "board": board_units,
            "traits": active_traits,
            "combat": combat_metrics
        }

    def fetch_and_normalize(self):
        raw = self.fetch_raw_data()
        if not raw:
            return {"status": "standby", "timestamp": int(time.time())}
        return self.normalize_game_state(raw)


class StreamerRelay:
    def __init__(self, ebs_url, streamer_token, channel_id, timeout_seconds=2.0):
        self.ebs_url = ebs_url.rstrip("/")
        self.streamer_token = streamer_token
        self.channel_id = str(channel_id)
        self.timeout = timeout_seconds

    def send_telemetry(self, state_payload):
        target_url = f"{self.ebs_url}/api/v1/streamer/telemetry"
        data_bytes = json.dumps(state_payload).encode("utf-8")
        req = urllib.request.Request(
            target_url,
            data=data_bytes,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.streamer_token}",
                "X-Twitch-Channel-Id": self.channel_id,
                "User-Agent": "TFT-OBS-Relay/1.0"
            },
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as res:
                return res.status in (200, 201, 202, 204)
        except Exception:
            return False
