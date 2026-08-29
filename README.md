# TFT Twitch Extension Workspace

This monorepo contains the full Twitch Extension suite for **Teamfight Tactics (TFT)**.

## Workspace Architecture

```
tft-extension/
 ├── desktop-app/      # [NEW] Standalone Local Desktop Companion ($0 serverless solution)
 ├── obs-script/       # Python OBS Studio Script / daemon
 ├── ebs/              # Optional Cloud Extension Backend Service (Fastify / Twitch PubSub)
 └── viewer-overlay/   # Twitch Video Overlay UI (HTML5 / Vanilla CSS / ES Modules)
```

---

## 🚀 Desktop Companion App (Serverless Mode)

The **Desktop Companion App** (`desktop-app/`) runs on the streamer's computer alongside TFT. It reads local game state via port `2999`, generates signed JWTs locally, and streams data directly to Twitch's Extension PubSub API.

### Features
- **$0 Cloud Hosting Costs**: No server hosting required.
- **Direct Twitch Helix Integration**: Uses `https://api.twitch.tv/helix/extensions/pubsub`.
- **Riot Games T&C Compliant**: Read-only passive memory API query; zero input injection.

### Quickstart

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run Desktop Companion**:
   ```bash
   npm --prefix desktop-app start
   ```

3. **Run Unit Tests**:
   ```bash
   npm test
   ```
