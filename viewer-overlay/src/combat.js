/**
 * Combat Statistics & Metrics Aggregator for TFT
 */

import { formatChampionName, getChampionMeta } from "./board.js";

export function formatMetricNumber(val) {
  const num = Number(val) || 0;
  if (num < 1000) return String(num);
  if (num < 1000000) {
    const formatted = (num / 1000).toFixed(1);
    return formatted.endsWith(".0") ? `${Math.floor(num / 1000)}k` : `${formatted}k`;
  }
  return `${(num / 1000000).toFixed(1)}M`;
}

export function sortCombatMetrics(metricsList = [], dimension = "damage") {
  if (!Array.isArray(metricsList)) return [];

  const keyMap = {
    damage: ["d", "damage"],
    taken: ["t", "taken"],
    healShield: ["h", "healShield", "healing"]
  };

  const keys = keyMap[dimension] || ["damage", "d"];

  const normalized = metricsList.map(item => {
    const champName = item.c || item.champion || "Unknown";
    const champMeta = getChampionMeta(champName);

    let val = 0;
    for (const k of keys) {
      if (item[k] !== undefined) {
        val = Number(item[k]);
        break;
      }
    }

    return {
      champion: champName,
      cleanName: champMeta.cleanName,
      iconUrl: champMeta.iconUrl,
      fallbackIconUrl: champMeta.fallbackIconUrl,
      value: val,
      raw: item
    };
  });

  normalized.sort((a, b) => b.value - a.value);
  return normalized;
}
