import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { JSDOM } from "jsdom";
import { renderHUD } from "../src/ui.js";
import { TFTOverlayApp } from "../src/app.js";

const HTML_SKELETON = `
<div id="overlay-root">
  <button id="hud-trigger" class="hud-trigger-btn"></button>
  <div id="hud-panel" class="hud-panel">
    <div class="hud-header">
      <span id="status-badge" class="status-badge standby">STANDBY</span>
      <button id="hud-close-btn" class="close-btn"></button>
    </div>
    <div id="player-summary" class="player-summary-bar" style="display: none;">
      <span id="stat-health" class="stat-value health">-</span>
      <span id="stat-level" class="stat-value">-</span>
      <span id="stat-gold" class="stat-value gold">-</span>
      <span id="stat-streak" class="stat-value">-</span>
    </div>
    <div id="standby-view" class="standby-container"></div>
  </div>
</div>
`;

describe("Viewer Overlay UI", () => {
  let dom;
  let document;
  let root;

  beforeEach(() => {
    dom = new JSDOM(HTML_SKELETON);
    document = dom.window.document;
    root = document.getElementById("overlay-root");
  });

  it("renders standby screen when game is inactive", () => {
    renderHUD(root, { st: "standby", t: 1000 });
    const statusBadge = root.querySelector("#status-badge");
    const summaryBar = root.querySelector("#player-summary");
    const standbyView = root.querySelector("#standby-view");

    assert.strictEqual(statusBadge.textContent, "STANDBY");
    assert.strictEqual(summaryBar.style.display, "none");
    assert.strictEqual(standbyView.style.display, "flex");
  });

  it("renders live player metrics when game is active", () => {
    const liveState = {
      st: "active",
      t: 1000,
      p: {
        hp: 84,
        lvl: 7,
        g: 48,
        strk: 3
      }
    };

    renderHUD(root, liveState);
    const statusBadge = root.querySelector("#status-badge");
    const summaryBar = root.querySelector("#player-summary");
    const standbyView = root.querySelector("#standby-view");
    const hp = root.querySelector("#stat-health");
    const lvl = root.querySelector("#stat-level");
    const gold = root.querySelector("#stat-gold");
    const streak = root.querySelector("#stat-streak");

    assert.strictEqual(statusBadge.textContent, "LIVE");
    assert.strictEqual(summaryBar.style.display, "grid");
    assert.strictEqual(standbyView.style.display, "none");
    assert.strictEqual(hp.textContent, "84");
    assert.strictEqual(lvl.textContent, "Lvl 7");
    assert.strictEqual(gold.textContent, "48g");
    assert.strictEqual(streak.textContent, "+3W");
  });

  it("toggles HUD panel expansion", () => {
    const app = new TFTOverlayApp(root);
    const panel = root.querySelector("#hud-panel");
    const trigger = root.querySelector("#hud-trigger");
    const closeBtn = root.querySelector("#hud-close-btn");

    assert.strictEqual(panel.classList.contains("hidden"), false);

    closeBtn.click();
    assert.strictEqual(panel.classList.contains("hidden"), true);

    trigger.click();
    assert.strictEqual(panel.classList.contains("hidden"), false);
  });
});
