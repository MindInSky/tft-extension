import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { JSDOM } from "jsdom";
import { renderHUD } from "../src/ui.js";

const HTML_SKELETON = `
<div id="overlay-root">
  <div id="hud-left" class="hud-panel-left">
    <button id="left-close-btn"></button>
    <div class="toggle-tab-group">
      <button class="toggle-tab-btn active" data-left-tab="bench">Bench Items</button>
      <button class="toggle-tab-btn" data-left-tab="traits">Active Traits</button>
    </div>
    <div class="panel-body">
      <div id="tab-bench-content" class="bench-grid"></div>
      <div id="tab-traits-content" class="traits-list" style="display:none;"></div>
    </div>
  </div>
  <div id="hud-right" class="hud-panel-right">
    <button id="right-close-btn"></button>
    <div class="toggle-tab-group">
      <button class="toggle-tab-btn active" data-right-tab="damage">Damage Meter</button>
      <button class="toggle-tab-btn" data-right-tab="lobby">Lobby Scoreboard</button>
    </div>
    <div class="panel-body">
      <div id="tab-damage-content"></div>
      <div id="tab-lobby-content" style="display:none;"></div>
    </div>
  </div>
  <div id="tft-tooltip" class="tft-tooltip">
    <div id="tooltip-title"></div>
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

  it("renders live player bench items and authentic damage meter with color segments", () => {
    const liveState = {
      st: "active",
      t: 1000,
      p: { hp: 84, lvl: 7, g: 48, strk: 3 },
      bch: ["BFSword", "NeedlesslyLargeRod"],
      trt: [{ k: "Set13_Enforcer", n: 4, t: 2 }],
      dmg: [
        { c: "TFT13_Caitlyn", phys: 4500, magic: 0, true: 1000, d: 5500 },
        { c: "TFT13_Vi", phys: 1200, magic: 3000, true: 0, d: 4200 }
      ],
      players: [
        { name: "MindInSky", hp: 84, lvl: 7 },
        { name: "Opponent1", hp: 42, lvl: 6 }
      ]
    };

    renderHUD(root, liveState);
    const benchSlots = root.querySelectorAll(".bench-item-slot");
    const combatRows = root.querySelectorAll(".combat-row");
    const physSegments = root.querySelectorAll(".segment-physical");
    const magicSegments = root.querySelectorAll(".segment-magic");
    const trueSegments = root.querySelectorAll(".segment-true");

    assert.strictEqual(benchSlots.length, 2);
    assert.strictEqual(combatRows.length, 2);
    assert.ok(physSegments.length >= 1);
    assert.ok(magicSegments.length >= 1);
    assert.ok(trueSegments.length >= 1);
  });

  it("switches left-side panel tabs between bench items and active traits", () => {
    const liveState = {
      st: "active",
      bch: ["BFSword"],
      trt: [{ k: "Set13_Enforcer", n: 4, t: 2 }]
    };

    renderHUD(root, liveState);
    const traitTabBtn = root.querySelector('[data-left-tab="traits"]');
    assert.ok(traitTabBtn);

    traitTabBtn.click();
    const traitsContainer = root.querySelector("#tab-traits-content");
    assert.strictEqual(traitsContainer.style.display, "flex");
    const traitRows = root.querySelectorAll(".trait-row");
    assert.strictEqual(traitRows.length, 1);
  });
});
