# TFT Twitch Extension Workspace

This monorepo contains the full Twitch Extension suite for **Teamfight Tactics (TFT)** managed with **`pnpm`**.

## Workspace Architecture

```
tft-extension/
 ├── desktop-app/      # Native Electron Desktop Companion ($0 serverless solution)
 ├── obs-script/       # Python OBS Studio Script / daemon
 ├── ebs/              # Optional Cloud Extension Backend Service (Fastify / Twitch PubSub)
 └── viewer-overlay/   # Twitch Video Overlay UI (HTML5 / Vanilla CSS / ES Modules)
```

---

## 🛠️ Package Manager & Workspace Flags Explanation

This repository uses **`pnpm`** as its package manager for efficient symlinked node_modules and fast monorepo builds.

### Understanding Directory Flags (`--prefix` vs `--filter`)

When working with monorepos containing multiple packages/subdirectories:

1. **`npm --prefix <directory> <command>`** (npm syntax):
   - Tells `npm` to execute the command inside the specified target subdirectory (e.g. `npm --prefix desktop-app start`).
   - `npm` changes its current working directory context to `<directory>` before looking for `package.json` scripts.

2. **`pnpm --filter <package_name> <command>`** (pnpm workspace syntax):
   - `pnpm` uses a workspace filter flag (`--filter`) to target specific projects by their `name` in `package.json` (e.g. `pnpm --filter tft-desktop-app start`).
   - Advantage: You do not need to specify folder paths; `pnpm` resolves the package graph automatically across `pnpm-workspace.yaml`.

---

## 🚀 Quickstart Guide (using `pnpm`)

### 1. Install Dependencies Across Workspace
```bash
pnpm install
```

### 2. Desktop Companion App (Serverless Mode)

#### Launch Electron Desktop Companion App in Dev Mode:
```bash
pnpm --filter tft-desktop-app run electron:dev
```

#### Build Windows Installer (`.exe`):
```bash
pnpm --filter tft-desktop-app run dist:win
```

### 3. Run Monorepo Test Suite
```bash
pnpm test
```
Runs tests across `obs-script`, `ebs`, `viewer-overlay`, and `desktop-app`.
