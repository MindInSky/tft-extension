# `obs-script/` - Lightweight Python OBS Studio Script

## Overview & Necessity
**Necessary**: **YES** (alternative lightweight integration for streamers).

`obs-script` provides a zero-installation, lightweight Python script intended to be loaded directly inside OBS Studio (`Tools -> Scripts`). It serves as an alternative to the standalone Electron Desktop Companion (`desktop-app`), allowing streamers to run game polling without running an extra desktop application window.

## Key Files
- `tft_live_relay.py`: OBS Studio Python script entrypoint. Handles timer callbacks, polling, and relaying updates to the EBS or Twitch PubSub.
- `riot_client.py`: Python module that connects to `https://127.0.0.1:2999/liveclientdata/allgamedata` with SSL verification disabled, handles rate limiting, and normalizes raw JSON data.
- `test_riot_client.py` & `test_differ.py`: Unit tests for data fetching, diff parsing, and error handling.

## Usage & Testing
- **In OBS**: Add `tft_live_relay.py` under **Tools -> Scripts** in OBS Studio, and configure the Extension Secret and Channel ID in the script properties panel.
- **Run Tests**: Execute `python3 -m unittest discover -s obs-script -p 'test_*.py'` (or via root `pnpm test:obs`).
