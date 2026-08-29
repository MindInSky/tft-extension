# `desktop-app/` - Standalone Electron & Local Relay Companion

## Overview & Necessity
**Necessary**: **YES** (for streamers who want a 1-click desktop app instead of running OBS Python scripts manually).

`desktop-app` is a cross-platform Electron application that serves as the local desktop companion for streamers. It polls the local Teamfight Tactics (TFT) Live Client API (`https://127.0.0.1:2999/liveclientdata/allgamedata`), computes diffs in real-time, signs JWT tokens using the Twitch Extension Secret, and posts live game state payloads directly to the Twitch Extension Backend Service (EBS) or Twitch PubSub.

## Key Features
- **Electron GUI**: User-friendly control panel for configuration, channel ID setting, and live status monitoring.
- **Riot Live Client Poller**: Fetches local game state from the TFT game client via HTTPS (ignoring local self-signed SSL certificate errors).
- **Delta Engine**: Computes minimal diffs so payloads stay within Twitch PubSub size limits.
- **JWT Signer**: Cryptographically signs payloads using HMAC SHA256 (`jose` library) for Twitch authorization.

## Scripts & Usage
- `pnpm dev` / `pnpm electron:dev`: Run the desktop app in local development mode.
- `pnpm build`: Compile TypeScript files from `src/` to `dist/`.
- `pnpm dist`: Package the application into native executables (NSIS installer for Windows, macOS binary).
- `pnpm test`: Execute unit tests via Vitest.
