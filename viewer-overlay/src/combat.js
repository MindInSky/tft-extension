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

  const normalized = metricsList.map(item => {
    const champName = item.c || item.champion || "Unknown";
    const champMeta = getChampionMeta(champName);

    const physical = Number(item.phys || item.physicalDamage || item.p || 0);
    const magic = Number(item.magic || item.magicDamage || item.m || 0);
    const trueDmg = Number(item.true || item.trueDamage || item.w || 0);
    let totalDmg = Number(item.d || item.damage || 0);
    if (totalDmg === 0 && (physical > 0 || magic > 0 || trueDmg > 0)) {
      totalDmg = physical + magic + trueDmg;
    }

    const taken = Number(item.t || item.taken || 0);
    const healShield = Number(item.h || item.healShield || item.healing || 0);

    let mainValue = totalDmg;
    if (dimension === "taken") mainValue = taken;
    if (dimension === "healShield") mainValue = healShield;

    return {
      champion: champName,
      cleanName: champMeta.cleanName,
      iconUrl: champMeta.iconUrl,
      fallbackIconUrl: champMeta.fallbackIconUrl,
      value: mainValue,
      physical,
      magic,
      trueDmg,
      totalDmg,
      taken,
      healShield,
      raw: item
    };
  });

  normalized.sort((a, b) => b.value - a.value);
  return normalized;
}
