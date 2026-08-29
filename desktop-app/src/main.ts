import { app, BrowserWindow, ipcMain, Tray, Menu } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { TFTDesktopEngine } from "./engine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let engine: TFTDesktopEngine | null = null;

const configPath = path.join(app.getPath("userData"), "config.json");

function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
  } catch (e) {
    console.error("Failed to load config:", e);
  }
  return {
    twitchClientId: "",
    twitchExtensionSecret: "",
    channelId: "",
    pollIntervalMs: 1000
  };
}

function saveConfig(cfg: any) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save config:", e);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: "TFT Twitch Companion",
    backgroundColor: "#0f172a",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const htmlPath = path.join(__dirname, "..", "src", "index.html");
  mainWindow.loadFile(htmlPath);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  const initialConfig = loadConfig();
  if (initialConfig.twitchClientId && initialConfig.channelId && initialConfig.twitchExtensionSecret) {
    engine = new TFTDesktopEngine(initialConfig);
    engine.start();
  }

  // Setup IPC Handlers
  ipcMain.handle("get-config", () => loadConfig());
  
  ipcMain.handle("save-config", (_event, newConfig) => {
    saveConfig(newConfig);
    if (engine) engine.stop();
    engine = new TFTDesktopEngine(newConfig);
    engine.start();
    return { success: true };
  });

  ipcMain.handle("get-engine-status", async () => {
    if (!engine) return { status: "stopped", broadcasted: false };
    return await engine.step();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
