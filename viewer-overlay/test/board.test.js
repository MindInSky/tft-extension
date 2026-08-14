import { describe, it } from "node:test";
import assert from "node:assert";
import { formatChampionName, getChampionMeta, getTraitMeta } from "../src/board.js";

describe("TFT Board & Trait Engine", () => {
  it("formats champion names cleanly from raw Riot IDs", () => {
    assert.strictEqual(formatChampionName("TFT13_Vi"), "Vi");
    assert.strictEqual(formatChampionName("TFT13_Caitlyn"), "Caitlyn");
    assert.strictEqual(formatChampionName("TFT13_Heimerdinger"), "Heimerdinger");
    assert.strictEqual(formatChampionName("Vi"), "Vi");
  });

  it("provides high-resolution metadata for champions", () => {
    const meta = getChampionMeta("TFT13_Vi");
    assert.strictEqual(meta.cleanName, "Vi");
    assert.ok(meta.iconUrl.startsWith("http"));
  });

  it("formats trait names and returns tier styles", () => {
    const traitMeta = getTraitMeta("TFT13_Enforcer", 4, 2);
    assert.strictEqual(traitMeta.cleanName, "Enforcer");
    assert.strictEqual(traitMeta.tierName, "Silver"); // Tier 2 = Silver
    assert.strictEqual(traitMeta.count, 4);
    assert.ok(traitMeta.iconUrl.startsWith("http"));
  });
});
