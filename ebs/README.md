# `ebs/` - Twitch Extension Backend Service

## Overview & Necessity
**Necessary**: **YES** (core cloud architecture requirement).

`ebs` is the cloud Node.js/TypeScript backend service (built with Fastify) that acts as the secure intermediary between the streamer's local game poller (Desktop App or OBS script) and Twitch viewers watching the broadcast.

## Responsibilities
- **Ingestion API**: Receives signed game state updates (`/api/update`) sent by authorized streamer instances.
- **JWT Verification**: Verifies incoming JWT bearer tokens using the shared Twitch Extension Secret to prevent unauthorized telemetry injection.
- **Twitch PubSub Broadcasting**: Relays verified game state deltas out to Twitch PubSub so thousands of extension overlays update instantly.
- **Rest State / Cache**: Holds the latest full game snapshot so newly joined viewers receive immediate state upon opening the stream overlay.

## Scripts & Usage
- `pnpm dev`: Start Fastify server in watch mode with `tsx`.
- `pnpm build`: Compile TypeScript into `dist/`.
- `pnpm start`: Run the compiled production server (`node dist/server.js`).
- `pnpm test`: Execute test suites using Vitest.
