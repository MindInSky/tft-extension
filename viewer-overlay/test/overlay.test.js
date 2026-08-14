import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { JSDOM } from "jsdom";
import { renderHUD, renderRecipeHelper, renderBoard, renderCombatStats } from "../src/ui.js";
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
    <div id="tab-board" class="tab-content" style="display: none;">
      <div class="board-container">
        <div id="traits-container" class="traits-summary"></div>
        <div id="champions-container" class="champions-grid"></div>
      </div>
    </div>
    <div id="tab-combat" class="tab-content" style="display: none;">
      <div id="combat-container" class="combat-container"></div>
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

  it("renders live player metrics, recipes, board and combat charts", () => {
    const liveState = {
      st: "active",
      t: 1000,
      p: {
        hp: 84,
        lvl: 7,
        g: 48,
        strk: 3
      },
      bch: ["TFT_Item_BFSword", "TFT_Item_ChainVest"],
      brd: [{ c: "TFT13_Vi", s: 2, i: ["TFT_Item_Bloodthirster"] }],
      trt: [{ k: "TFT13_Enforcer", n: 4, t: 2 }],
      dmg: [
        { c: "TFT13_Caitlyn", d: 14500, t: 1200, h: 0 },
        { c: "TFT13_Vi", d: 5200, t: 8400, h: 1800 }
      ]
    };

    renderHUD(root, liveState);
    const statusBadge = root.querySelector("#status-badge");
    const summaryBar = root.querySelector("#player-summary");
    const recipeCards = root.querySelectorAll(".recipe-card");
    const champCards = root.querySelectorAll(".champion-card");
    const combatRows = root.querySelectorAll(".combat-row");

    assert.strictEqual(statusBadge.textContent, "LIVE");
    assert.strictEqual(summaryBar.style.display, "grid");
    assert.strictEqual(recipeCards.length, 1);
    assert.strictEqual(champCards.length, 1);
    assert.strictEqual(combatRows.length, 2);
    assert.ok(combatRows[0].textContent.includes("Caitlyn"));
    assert.ok(combatRows[0].textContent.includes("14.5k"));
  });

  it("switches combat metric dimension on pill click", () => {
    const metrics = [
      { c: "TFT13_Caitlyn", d: 14500, t: 1200, h: 0 },
      { c: "TFT13_Vi", d: 5200, t: 8400, h: 1800 }
    ];

    renderCombatStats(root, metrics);
    const takenPill = root.querySelector('[data-dimension="taken"]');
    assert.ok(takenPill);

    takenPill.click();
    const rows = root.querySelectorAll(".combat-row");
    // Vi should now be first under 'taken'
    assert.ok(rows[0].textContent.includes("Vi"));
    assert.ok(rows[0].textContent.includes("8.4k"));
  });

  it("filters recipe combinations when clicking component chip", () => {
    const bench = ["BFSword", "RecurveBow"];
    renderRecipeHelper(root, bench);

    const chips = root.querySelectorAll(".component-chip");
    assert.strictEqual(chips.length, 2);

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
