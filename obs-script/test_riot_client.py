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

    def test_parse_active_player_econ(self):
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
                    "scores": {
                        "assists": 0,
                        "creepScore": 0,
                        "deaths": 0,
                        "kills": 0,
                        "wardScore": 0.0
                    },
                    "streak": 3,
                    "isDead": False,
                    "items": []
                }
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
        self.assertIn("timestamp", normalized)

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
            "timestamp": 1723617000
        }

        with patch("urllib.request.urlopen") as mock_urlopen:
            mock_response = MagicMock()
            mock_response.status = 200
            mock_response.read.return_value = json.dumps({"success": True}).encode("utf-8")
            mock_urlopen.return_value.__enter__.return_value = mock_response

            success = relay.send_telemetry(sample_state)
            self.assertTrue(success)

            # Verify request headers and URL
            req = mock_urlopen.call_args[0][0]
            self.assertEqual(req.full_url, "https://ebs.example.com/api/v1/streamer/telemetry")
            self.assertEqual(req.headers.get("Authorization"), "Bearer secret_streamer_jwt")
            self.assertEqual(req.headers.get("X-twitch-channel-id"), "12345678")
            self.assertEqual(req.headers.get("Content-type"), "application/json")

if __name__ == "__main__":
    unittest.main()
