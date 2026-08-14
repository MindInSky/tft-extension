import unittest
from unittest.mock import patch, MagicMock
import json
import os
import sys
import urllib.error

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from riot_client import RiotLiveClient, StreamerRelay

class TestRiotLiveClient(unittest.TestCase):
    def setUp(self):
        self.client = RiotLiveClient(endpoint="https://127.0.0.1:2999")

    def test_parse_active_player_all_stats_and_combat(self):
        mock_raw_data = {
            "activePlayer": {
                "summonerName": "TFTStreamer#NA1",
                "level": 8,
                "currentGold": 45,
                "championStats": {
                    "currentHealth": 76.0,
                    "maxHealth": 100.0
                }
            },
            "allPlayers": [
                {
                    "summonerName": "TFTStreamer#NA1",
                    "level": 8,
                    "streak": 3,
                    "isDead": False,
                    "items": [
                        {"itemID": 1, "rawItemName": "TFT_Item_BFSword"}
                    ],
                    "champions": [
                        {"name": "TFT13_Vi", "starLevel": 2, "items": ["TFT_Item_Bloodthirster"]},
                        {"name": "TFT13_Caitlyn", "starLevel": 2, "items": ["TFT_Item_InfinityEdge"]}
                    ],
                    "traits": [
                        {"name": "TFT13_Enforcer", "numUnits": 4, "style": 2}
                    ]
                }
            ],
            "combatStats": [
                {"champion": "TFT13_Caitlyn", "damage": 12450, "taken": 1100, "healShield": 0},
                {"champion": "TFT13_Vi", "damage": 5200, "taken": 8900, "healShield": 2300}
            ],
            "gameData": {
                "gameMode": "TFT",
                "gameTime": 1240.5
            }
        }

        normalized = self.client.normalize_game_state(mock_raw_data)
        self.assertEqual(normalized["status"], "active")
        self.assertEqual(normalized["player"]["level"], 8)
        self.assertEqual(normalized["player"]["gold"], 45)
        self.assertEqual(normalized["player"]["health"], 76)
        self.assertEqual(normalized["player"]["streak"], 3)
        self.assertIn("combat", normalized)
        self.assertEqual(len(normalized["combat"]), 2)
        self.assertEqual(normalized["combat"][0]["champion"], "TFT13_Caitlyn")
        self.assertEqual(normalized["combat"][0]["damage"], 12450)
        self.assertEqual(normalized["combat"][0]["taken"], 1100)

    def test_handle_connection_failure_returns_standby(self):
        with patch("urllib.request.urlopen") as mock_urlopen:
            mock_urlopen.side_effect = urllib.error.URLError("Connection refused")
            state = self.client.fetch_and_normalize()
            self.assertEqual(state["status"], "standby")
            self.assertIsNone(state.get("player"))

    def test_relay_post_to_ebs(self):
        relay = StreamerRelay(
            ebs_url="https://ebs.example.com",
            streamer_token="secret_streamer_jwt",
            channel_id="12345678"
        )
        sample_state = {
            "status": "active",
            "player": {"level": 7, "gold": 30, "health": 80, "streak": 2},
            "bench": ["TFT_Item_BFSword"],
            "board": [{"champion": "TFT13_Vi", "stars": 2, "items": []}],
            "combat": [{"champion": "TFT13_Vi", "damage": 5000, "taken": 2000, "healShield": 500}],
            "timestamp": 1723617000
        }

        with patch("urllib.request.urlopen") as mock_urlopen:
            mock_response = MagicMock()
            mock_response.status = 200
            mock_response.read.return_value = json.dumps({"success": True}).encode("utf-8")
            mock_urlopen.return_value.__enter__.return_value = mock_response

            success = relay.send_telemetry(sample_state)
            self.assertTrue(success)

if __name__ == "__main__":
    unittest.main()
