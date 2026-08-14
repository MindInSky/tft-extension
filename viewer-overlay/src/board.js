/**
 * TFT Board Champions & Trait Synergies Metadata Resolver
 */

export function formatChampionName(rawName) {
  if (!rawName) return "Unknown";
  // Remove TFT set prefixes like "TFT13_", "TFT12_", etc.
  return rawName.replace(/^TFT\d+_/i, "").trim();
}

export function formatTraitName(rawName) {
  if (!rawName) return "Unknown";
  return rawName.replace(/^TFT\d+_/i, "").trim();
}

export function getChampionMeta(rawName) {
  const cleanName = formatChampionName(rawName);
  const normalizedKey = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "");

  // CommunityDragon character square portrait URL
  const iconUrl = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/-1.png`;
  const dynamicIconUrl = `https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${cleanName}.png`;

  return {
    rawName,
    cleanName,
    iconUrl: dynamicIconUrl,
    fallbackIconUrl: iconUrl
  };
}

export function getTraitMeta(rawName, count = 1, tierStyle = 0) {
  const cleanName = formatTraitName(rawName);
  const normalizedKey = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "");

  let tierName = "None";
  let tierColor = "hsl(215, 16%, 55%)";

  switch (tierStyle) {
    case 1:
      tierName = "Bronze";
      tierColor = "hsl(30, 60%, 45%)";
      break;
    case 2:
      tierName = "Silver";
      tierColor = "hsl(210, 20%, 75%)";
      break;
    case 3:
      tierName = "Gold";
      tierColor = "hsl(42, 90%, 55%)";
      break;
    case 4:
      tierName = "Prismatic";
      tierColor = "hsl(280, 80%, 70%)";
      break;
    default:
      tierName = "Active";
      tierColor = "hsl(215, 20%, 65%)";
  }

  const iconUrl = `https://raw.communitydragon.org/latest/game/assets/ux/tft/trait_icons/${normalizedKey}.png`;

  return {
    rawName,
    cleanName,
    count,
    tierStyle,
    tierName,
    tierColor,
    iconUrl
  };
}
