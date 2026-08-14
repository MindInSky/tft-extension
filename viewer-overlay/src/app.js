import { renderHUD } from "./ui.js";

export class TFTOverlayApp {
  constructor(rootElement) {
    this.root = rootElement;
    this.state = { st: "standby", t: Math.floor(Date.now() / 1000) };
    this.isExpanded = true;

    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.panel = this.root.querySelector("#hud-panel");
    this.triggerBtn = this.root.querySelector("#hud-trigger");
    this.closeBtn = this.root.querySelector("#hud-close-btn");
  }

  bindEvents() {
    if (this.triggerBtn) {
      this.triggerBtn.addEventListener("click", () => this.togglePanel());
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.togglePanel(false));
    }
  }

  togglePanel(forceState) {
    this.isExpanded = typeof forceState === "boolean" ? forceState : !this.isExpanded;
    if (this.panel) {
      this.panel.classList.toggle("hidden", !this.isExpanded);
    }
  }

  updateState(newState) {
    this.state = newState;
    renderHUD(this.panel, this.state);
  }

  initTwitchExtension() {
    if (typeof window !== "undefined" && window.Twitch && window.Twitch.ext) {
      window.Twitch.ext.listen("broadcast", (target, contentType, message) => {
        try {
          const parsed = JSON.parse(message);
          this.updateState(parsed);
        } catch (e) {
          console.error("Failed to parse Twitch PubSub payload:", e);
        }
      });

      window.Twitch.ext.onAuthorized((auth) => {
        console.log("[TFT Ext] Authorized for channel:", auth.channelId);
      });
    }
  }
}

// Auto-boot if in browser
if (typeof window !== "undefined" && document.getElementById("overlay-root")) {
  window.addEventListener("DOMContentLoaded", () => {
    const app = new TFTOverlayApp(document.getElementById("overlay-root"));
    app.initTwitchExtension();
    window.__TFT_APP__ = app;
  });
}
