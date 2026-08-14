import { describe, it } from "node:test";
import assert from "node:assert";
import {
  normalizeItemId,
  getItemMetadata,
  findCraftableRecipes,
  getComponentCombinations
} from "../src/recipes.js";

describe("TFT Recipe Engine", () => {
  it("normalizes Riot item identifiers to standard keys", () => {
    assert.strictEqual(normalizeItemId("TFT_Item_BFSword"), "BFSword");
    assert.strictEqual(normalizeItemId("TFT_Item_ChainVest"), "ChainVest");
    assert.strictEqual(normalizeItemId("BFSword"), "BFSword");
    assert.strictEqual(normalizeItemId("1"), "BFSword"); // ID 1 is BF Sword
  });

  it("finds zero craftable recipes with insufficient components", () => {
    assert.deepStrictEqual(findCraftableRecipes([]), []);
    assert.deepStrictEqual(findCraftableRecipes(["BFSword"]), []);
  });

  it("finds exact craftable recipes from bench components", () => {
    const bench = ["TFT_Item_BFSword", "TFT_Item_ChainVest"];
    const craftable = findCraftableRecipes(bench);

    assert.strictEqual(craftable.length, 1);
    assert.strictEqual(craftable[0].id, "EdgeOfNight");
    assert.strictEqual(craftable[0].name, "Edge of Night");
    assert.deepStrictEqual(craftable[0].recipe.sort(), ["BFSword", "ChainVest"].sort());
  });

  it("finds multiple craftable permutations with duplicate components", () => {
    const bench = ["BFSword", "BFSword", "RecurveBow"];
    const craftable = findCraftableRecipes(bench);

    const ids = craftable.map(c => c.id);
    assert.ok(ids.includes("Deathblade")); // BFSword + BFSword
    assert.ok(ids.includes("GiantSlayer")); // BFSword + RecurveBow
  });

  it("retrieves full recipe branch for a selected component", () => {
    const combos = getComponentCombinations("BFSword");
    assert.ok(combos.length >= 8);

    const deathbladeCombo = combos.find(c => c.otherComponent === "BFSword");
    assert.ok(deathbladeCombo);
    assert.strictEqual(deathbladeCombo.resultItem.id, "Deathblade");
  });

  it("provides rich tooltip metadata for completed items and components", () => {
    const meta = getItemMetadata("InfinityEdge");
    assert.ok(meta);
    assert.strictEqual(meta.name, "Infinity Edge");
    assert.ok(meta.stats.ad > 0);
    assert.ok(meta.description.length > 0);
    assert.ok(meta.iconUrl.startsWith("http"));
  });
});
