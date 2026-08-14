import unittest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from riot_client import StateDiffer, get_adaptive_interval_ms

class TestDifferAndAdaptivePolling(unittest.TestCase):
    def setUp(self):
        self.differ = StateDiffer()

    def test_state_diff_detection(self):
        state1 = {
            "status": "active",
            "player": {"level": 8, "gold": 50, "health": 80, "streak": 2},
            "bench": ["BFSword"],
            "timestamp": 1000
        }
        # First state should always trigger change
        self.assertTrue(self.differ.has_changed(state1))

        # Identical state with different timestamp should be ignored as duplicate
        state1_same = {
            "status": "active",
            "player": {"level": 8, "gold": 50, "health": 80, "streak": 2},
            "bench": ["BFSword"],
            "timestamp": 1001
        }
        self.assertFalse(self.differ.has_changed(state1_same))

        # Modified gold should trigger change
        state2 = {
            "status": "active",
            "player": {"level": 8, "gold": 46, "health": 80, "streak": 2},
            "bench": ["BFSword"],
            "timestamp": 1002
        }
        self.assertTrue(self.differ.has_changed(state2))

    def test_adaptive_interval_calculation(self):
        standby_state = {"status": "standby"}
        self.assertEqual(get_adaptive_interval_ms(standby_state), 2000)

        active_state = {
            "status": "active",
            "combat": [{"champion": "TFT13_Vi", "damage": 5000}]
        }
        self.assertEqual(get_adaptive_interval_ms(active_state), 500)

        calm_active_state = {
            "status": "active",
            "combat": []
        }
        self.assertEqual(get_adaptive_interval_ms(calm_active_state), 1000)

if __name__ == "__main__":
    unittest.main()
