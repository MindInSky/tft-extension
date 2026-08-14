import { BASE_COMPONENTS, COMPLETED_ITEMS } from "./items_data.js";

// ID Normalization map for raw Riot API item strings or numeric IDs
const ID_ALIAS_MAP = {
  "1": "BFSword",
  "2": "RecurveBow",
  "3": "NeedlesslyLargeRod",
  "4": "TearOfTheGoddess",
  "5": "ChainVest",
  "6": "NegatronCloak",
  "7": "GiantsBelt",
  "8": "Spatula",
  "9": "SparringGloves",
  "TFT_Item_BFSword": "BFSword",
  "TFT_Item_RecurveBow": "RecurveBow",
  "TFT_Item_NeedlesslyLargeRod": "NeedlesslyLargeRod",
  "TFT_Item_TearOfTheGoddess": "TearOfTheGoddess",
  "TFT_Item_ChainVest": "ChainVest",
  "TFT_Item_NegatronCloak": "NegatronCloak",
  "TFT_Item_GiantsBelt": "GiantsBelt",
  "TFT_Item_Spatula": "Spatula",
  "TFT_Item_SparringGloves": "SparringGloves"
};

export function normalizeItemId(rawId) {
  if (!rawId) return "";
  const cleaned = String(rawId).trim();
  if (ID_ALIAS_MAP[cleaned]) {
    return ID_ALIAS_MAP[cleaned];
  }
  // Strip 'TFT_Item_' prefix if present
  const stripped = cleaned.replace(/^TFT_Item_/, "");
  if (BASE_COMPONENTS[stripped] || COMPLETED_ITEMS[stripped]) {
    return stripped;
  }
  // Try case-insensitive matching
  const lower = stripped.toLowerCase();
  for (const key of Object.keys(BASE_COMPONENTS)) {
    if (key.toLowerCase() === lower) return key;
  }
  for (const key of Object.keys(COMPLETED_ITEMS)) {
    if (key.toLowerCase() === lower) return key;
  }
  return stripped;
}

export function getItemMetadata(rawId) {
  const normalized = normalizeItemId(rawId);
  if (BASE_COMPONENTS[normalized]) {
    return { ...BASE_COMPONENTS[normalized], isComponent: true };
  }
  if (COMPLETED_ITEMS[normalized]) {
    return { ...COMPLETED_ITEMS[normalized], isComponent: false };
  }
  return {
    id: normalized,
    name: normalized,
    iconUrl: "https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/item_icons/standard/unknown.png",
    stats: {},
    description: "Item details unavailable"
  };
}

/**
 * Finds all craftable completed item recipes given an array of component item IDs.
 */
export function findCraftableRecipes(rawComponentsList) {
  if (!Array.isArray(rawComponentsList) || rawComponentsList.length < 2) {
    return [];
  }

  // Count available base components
  const componentCounts = {};
  for (const raw of rawComponentsList) {
    const norm = normalizeItemId(raw);
    if (BASE_COMPONENTS[norm]) {
      componentCounts[norm] = (componentCounts[norm] || 0) + 1;
    }
  }

  const craftable = [];
  const checkedPairs = new Set();

  // Test against all completed item recipes
  for (const item of Object.values(COMPLETED_ITEMS)) {
    const [c1, c2] = item.recipe;
    const pairKey = [c1, c2].sort().join("+");

    if (checkedPairs.has(pairKey)) continue;

    if (c1 === c2) {
      if ((componentCounts[c1] || 0) >= 2) {
        craftable.push(item);
        checkedPairs.add(pairKey);
      }
    } else {
      if ((componentCounts[c1] || 0) >= 1 && (componentCounts[c2] || 0) >= 1) {
        craftable.push(item);
        checkedPairs.add(pairKey);
      }
    }
  }

  return craftable;
}

/**
 * Returns all possible combinations for a specific component with all other components.
 */
export function getComponentCombinations(selectedComponentId) {
  const norm = normalizeItemId(selectedComponentId);
  if (!BASE_COMPONENTS[norm]) return [];

  const results = [];
  for (const otherKey of Object.keys(BASE_COMPONENTS)) {
    for (const item of Object.values(COMPLETED_ITEMS)) {
      const [c1, c2] = item.recipe;
      if ((c1 === norm && c2 === otherKey) || (c2 === norm && c1 === otherKey)) {
        results.push({
          sourceComponent: norm,
          otherComponent: otherKey,
          otherMeta: BASE_COMPONENTS[otherKey],
          resultItem: item
        });
        break;
      }
    }
  }
  return results;
}
