#!/usr/bin/env python3
"""
OBS Studio Python Script & Standalone Daemon for TFT Live Client Relay.
Features adaptive sub-second polling and state-change diff broadcasting.
"""

import sys
import os
import time

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from riot_client import RiotLiveClient, StreamerRelay, StateDiffer, get_adaptive_interval_ms

# OBS script state variables
ebs_url = "http://localhost:8080"
streamer_token = ""
channel_id = ""
poll_interval_ms = 1000
is_running = False

riot_client = None
relay = None
differ = None

def init_services():
    global riot_client, relay, differ
    riot_client = RiotLiveClient()
    relay = StreamerRelay(ebs_url=ebs_url, streamer_token=streamer_token, channel_id=channel_id)
    differ = StateDiffer()

def poll_and_send():
    global riot_client, relay, differ
    if not streamer_token or not channel_id:
        return
    if not riot_client or not relay or not differ:
        init_services()

    state = riot_client.fetch_and_normalize()
    
    # Broadcast only if state changed or heartbeat expired
    if differ.has_changed(state):
        relay.send_telemetry(state)

# --- OBS Python Script API Hooks ---

def script_description():
    return (
        "<b>TFT Live Twitch Extension Relay</b><br/>"
        "Polls local Teamfight Tactics In-Game API (port 2999) with adaptive frequency "
        "and broadcasts low-latency updates to Twitch Extension Backend Service."
    )

def script_update(settings):
    global ebs_url, streamer_token, channel_id, poll_interval_ms, is_running
    try:
        import obspython as obs # type: ignore
        ebs_url = obs.obs_data_get_string(settings, "ebs_url") or "http://localhost:8080"
        streamer_token = obs.obs_data_get_string(settings, "streamer_token") or ""
        channel_id = obs.obs_data_get_string(settings, "channel_id") or ""
        poll_interval_ms = obs.obs_data_get_int(settings, "poll_interval_ms") or 1000

        init_services()

        obs.timer_remove(poll_and_send)
        if streamer_token and channel_id:
            obs.timer_add(poll_and_send, poll_interval_ms)
            is_running = True
    except ImportError:
        pass

def script_properties():
    try:
        import obspython as obs # type: ignore
        props = obs.obs_properties_create()
        obs.obs_properties_add_text(props, "ebs_url", "EBS Service URL", obs.OBS_TEXT_DEFAULT)
        obs.obs_properties_add_text(props, "channel_id", "Twitch Channel ID", obs.OBS_TEXT_DEFAULT)
        obs.obs_properties_add_text(props, "streamer_token", "Streamer Auth Token", obs.OBS_TEXT_PASSWORD)
        obs.obs_properties_add_int(props, "poll_interval_ms", "Poll Interval (ms)", 250, 5000, 250)
        return props
    except ImportError:
        return None

def script_unload():
    try:
        import obspython as obs # type: ignore
        obs.timer_remove(poll_and_send)
    except ImportError:
        pass

# --- Standalone CLI mode for testing outside OBS ---
if __name__ == "__main__":
    print("[TFT OBS Relay] Running in adaptive daemon mode. Polling local Riot client...")
    client = RiotLiveClient()
    diff_tracker = StateDiffer()
    
    state = client.fetch_and_normalize()
    interval = get_adaptive_interval_ms(state)
    has_diff = diff_tracker.has_changed(state)
    
    print(f"Status: {state.get('status')} | Adaptive Interval: {interval}ms | Changed: {has_diff}")
    if state.get("player"):
        p = state["player"]
        print(f"Player: {p.get('name')} | Lvl: {p.get('level')} | Gold: {p.get('gold')} | HP: {p.get('health')}")
    else:
        print("Standby mode active.")
