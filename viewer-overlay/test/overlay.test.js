import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { JSDOM } from "jsdom";
import { renderHUD, renderRecipeHelper } from "../src/ui.js";
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
    <div id="hud-tabs" class="hud-nav-tabs" style="display: none;">
      <button class="nav-tab active" data-tab="recipes">
        <span id="recipe-tab-badge" class="tab-badge">0</span>
      </button>
      <button class="nav-tab" data-tab="board"></button>
      <button class="nav-tab" data-tab="combat"></button>
    </div>
    <div id="tab-recipes" class="tab-content" style="display: none;">
      <div id="component-filters" class="component-filter-bar">
        <div id="component-chips-container" class="filter-chips-list"></div>
      </div>
      <div id="recipe-list" class="recipe-list"></div>
    </div>
    <div id="standby-view" class="standby-container"></div>
  </div>
  <div id="tft-tooltip" class="tft-tooltip">
    <img id="tooltip-icon" src="" />
    <span id="tooltip-title"></span>
    <div id="tooltip-stats"></div>
    <div id="tooltip-desc"></div>
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

  it("renders live player metrics and craftable recipe count", () => {
    const liveState = {
      st: "active",
      t: 1000,
      p: {
        hp: 84,
        lvl: 7,
        g: 48,
        strk: 3
      },
      bch: ["TFT_Item_BFSword", "TFT_Item_ChainVest"]
    };

    renderHUD(root, liveState);
    const statusBadge = root.querySelector("#status-badge");
    const summaryBar = root.querySelector("#player-summary");
    const recipeBadge = root.querySelector("#recipe-tab-badge");
    const recipeCards = root.querySelectorAll(".recipe-card");

    assert.strictEqual(statusBadge.textContent, "LIVE");
    assert.strictEqual(summaryBar.style.display, "grid");
    assert.strictEqual(recipeBadge.textContent, "1");
    assert.strictEqual(recipeCards.length, 1);
    assert.ok(recipeCards[0].textContent.includes("Edge of Night"));
  });

  it("filters recipe combinations when clicking component chip", () => {
    const bench = ["BFSword", "RecurveBow"];
    renderRecipeHelper(root, bench);

    const chips = root.querySelectorAll(".component-chip");
    assert.strictEqual(chips.length, 2);

    // Click BFSword chip to see its full recipe tree
    chips[0].click();
    const updatedCards = root.querySelectorAll(".recipe-card");
    assert.ok(updatedCards.length >= 8);
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
