import { describe, it } from "node:test";
import assert from "node:assert";
import { formatMetricNumber, sortCombatMetrics } from "../src/combat.js";

describe("TFT Combat Stats Engine", () => {
  it("formats large numbers into compact human-readable strings", () => {
    assert.strictEqual(formatMetricNumber(0), "0");
    assert.strictEqual(formatMetricNumber(850), "850");
    assert.strictEqual(formatMetricNumber(1200), "1.2k");
    assert.strictEqual(formatMetricNumber(14580), "14.6k");
    assert.strictEqual(formatMetricNumber(105400), "105.4k");
  });

  it("sorts combat metrics descending by active metric dimension", () => {
    const rawMetrics = [
      { champion: "TFT13_Vi", damage: 4500, taken: 9500, healShield: 2000 },
      { champion: "TFT13_Caitlyn", damage: 16000, taken: 1200, healShield: 0 },
      { champion: "TFT13_Ambessa", damage: 8000, taken: 6000, healShield: 800 }
    ];

    const damageSorted = sortCombatMetrics(rawMetrics, "damage");
    assert.strictEqual(damageSorted[0].champion, "TFT13_Caitlyn");
    assert.strictEqual(damageSorted[1].champion, "TFT13_Ambessa");
    assert.strictEqual(damageSorted[2].champion, "TFT13_Vi");

    const takenSorted = sortCombatMetrics(rawMetrics, "taken");
    assert.strictEqual(takenSorted[0].champion, "TFT13_Vi");
    assert.strictEqual(takenSorted[1].champion, "TFT13_Ambessa");
    assert.strictEqual(takenSorted[2].champion, "TFT13_Caitlyn");

    const healSorted = sortCombatMetrics(rawMetrics, "healShield");
    assert.strictEqual(healSorted[0].champion, "TFT13_Vi");
    assert.strictEqual(healSorted[1].champion, "TFT13_Ambessa");
    assert.strictEqual(healSorted[2].champion, "TFT13_Caitlyn");
  });
});
