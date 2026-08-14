import ssl
import json
import time
import urllib.request
import urllib.error

class RiotLiveClient:
    def __init__(self, endpoint="https://127.0.0.1:2999", timeout_seconds=1.5):
        self.endpoint = endpoint.rstrip("/")
        self.timeout = timeout_seconds
        
        # Self-signed certificate SSL context for local Riot Client loopback
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
        
        # Health from championStats or default to 100
        champ_stats = active_player.get("championStats", {})
        health = int(champ_stats.get("currentHealth", 100))

        # Find matching player in allPlayers for additional stats (e.g., streak)
        all_players = raw_data.get("allPlayers", [])
        matched_player = None
        for p in all_players:
            if p.get("summonerName") == summoner_name or (summoner_name and summoner_name.startswith(p.get("summonerName", "@#$"))):
                matched_player = p
                break
        
        streak = 0
        if matched_player:
            streak = matched_player.get("streak", 0)

        return {
            "status": "active",
            "timestamp": int(time.time()),
            "player": {
                "name": summoner_name,
                "level": level,
                "gold": gold,
                "health": health,
                "streak": streak
            }
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
        except Exception as e:
            return False
