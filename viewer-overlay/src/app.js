import { renderHUD, setupTooltips } from "./ui.js";
import { StreamSyncBuffer } from "./sync_buffer.js";

export class TFTOverlayApp {
  constructor(rootElement) {
    this.root = rootElement;
    this.state = { st: "standby", t: Math.floor(Date.now() / 1000) };
    this.isExpanded = true;
    this.activeTab = "recipes";

    this.syncBuffer = new StreamSyncBuffer({
      mode: "stream-sync",
      delayMs: 2500,
      onEmit: (delayedState) => {
        this.renderState(delayedState);
      }
    });

    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.panel = this.root.querySelector("#hud-panel");
    this.triggerBtn = this.root.querySelector("#hud-trigger");
    this.closeBtn = this.root.querySelector("#hud-close-btn");
    this.tooltip = this.root.querySelector("#tft-tooltip");
    
    if (this.tooltip) {
      setupTooltips(this.root, this.tooltip);
    }
  }

  bindEvents() {
    if (this.triggerBtn) {
      this.triggerBtn.addEventListener("click", () => this.togglePanel());
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.togglePanel(false));
    }

    // Tab switching
    const tabBtns = this.root.querySelectorAll(".nav-tab");
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const tabName = btn.getAttribute("data-tab");
        this.switchTab(tabName);
      });
    });
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    const tabBtns = this.root.querySelectorAll(".nav-tab");
    tabBtns.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabName);
    });

    const allTabs = ["recipes", "board", "combat"];
    allTabs.forEach(t => {
      const tabContent = this.root.querySelector(`#tab-${t}`);
      if (tabContent) {
        tabContent.style.display = t === tabName ? "block" : "none";
      }
    });
  }

  togglePanel(forceState) {
    this.isExpanded = typeof forceState === "boolean" ? forceState : !this.isExpanded;
    if (this.panel) {
      this.panel.classList.toggle("hidden", !this.isExpanded);
    }
  }

  updateState(newState) {
    this.syncBuffer.push(newState);
  }

  renderState(state) {
    this.state = state;
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
