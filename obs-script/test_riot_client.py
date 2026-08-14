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

    def test_parse_active_player_econ_bench_board_and_traits(self):
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
                        {"itemID": 1, "rawItemName": "TFT_Item_BFSword"},
                        {"itemID": 5, "rawItemName": "TFT_Item_ChainVest"}
                    ],
                    "champions": [
                        {
                            "name": "TFT13_Vi",
                            "starLevel": 2,
                            "items": ["TFT_Item_Bloodthirster", "TFT_Item_TitansResolve"]
                        },
                        {
                            "name": "TFT13_Caitlyn",
                            "starLevel": 2,
                            "items": ["TFT_Item_InfinityEdge", "TFT_Item_LastWhisper"]
                        }
                    ],
                    "traits": [
                        {"name": "TFT13_Enforcer", "numUnits": 4, "style": 2},
                        {"name": "TFT13_Sniper", "numUnits": 2, "style": 1}
                    ]
                }
            ],
            "itemData": [
                {"name": "TFT_Item_BFSword", "slot": 0},
                {"name": "TFT_Item_ChainVest", "slot": 1}
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
        self.assertIn("bench", normalized)
        self.assertIn("TFT_Item_BFSword", normalized["bench"])

        # Board verification
        self.assertIn("board", normalized)
        self.assertEqual(len(normalized["board"]), 2)
        vi_unit = normalized["board"][0]
        self.assertEqual(vi_unit["champion"], "TFT13_Vi")
        self.assertEqual(vi_unit["stars"], 2)
        self.assertEqual(len(vi_unit["items"]), 2)

        # Traits verification
        self.assertIn("traits", normalized)
        self.assertEqual(len(normalized["traits"]), 2)
        self.assertEqual(normalized["traits"][0]["key"], "TFT13_Enforcer")
        self.assertEqual(normalized["traits"][0]["count"], 4)
        self.assertEqual(normalized["traits"][0]["tier"], 2)

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
            "bench": ["TFT_Item_BFSword", "TFT_Item_ChainVest"],
            "board": [{"champion": "TFT13_Vi", "stars": 2, "items": ["TFT_Item_Bloodthirster"]}],
            "traits": [{"key": "TFT13_Enforcer", "count": 2, "tier": 1}],
            "timestamp": 1723617000
        }

        with patch("urllib.request.urlopen") as mock_urlopen:
            mock_response = MagicMock()
            mock_response.status = 200
            mock_response.read.return_value = json.dumps({"success": True}).encode("utf-8")
            mock_urlopen.return_value.__enter__.return_value = mock_response

            success = relay.send_telemetry(sample_state)
            self.assertTrue(success)

            req = mock_urlopen.call_args[0][0]
            self.assertEqual(req.full_url, "https://ebs.example.com/api/v1/streamer/telemetry")
            self.assertEqual(req.headers.get("Authorization"), "Bearer secret_streamer_jwt")
            self.assertEqual(req.headers.get("X-twitch-channel-id"), "12345678")

if __name__ == "__main__":
    unittest.main()
