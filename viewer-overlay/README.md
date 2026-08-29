# `viewer-overlay/` - Twitch Video Overlay Frontend

## Overview & Necessity
**Necessary**: **YES** (core viewer-facing interface).

`viewer-overlay` contains the web application embedded directly into the Twitch Video Player overlay. Viewers watching the Twitch stream interact with this HTML/JS frontend to view live TFT game state, player board compositions, items, traits, and champion stats in real-time.

## Key Features & Architecture
- **Twitch Extension Helper**: Integrates with `window.Twitch.ext` to listen for PubSub broadcasts (`onAuthorized`, `listen`).
- **Interactive UI**: Rendered overlays showing gold, level, stage, unit traits, bench/board positions, and item allocations.
- **Local Dev Rig**: Includes `dev-rig.html` to simulate Twitch PubSub events and test UI responsiveness without broadcasting live on Twitch.

## Scripts & Usage
- `pnpm dev`: Start Vite development server (default port: `3000`).
- `dev-rig.html`: Open in browser to simulate live Twitch Extension messaging during development.
- `pnpm test`: Run UI component and logic tests.
