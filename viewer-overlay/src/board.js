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
  let tierBg = "hsla(215, 16%, 25%, 0.8)";

  switch (tierStyle) {
    case 1:
      tierName = "Bronze";
      tierColor = "hsl(28, 60%, 55%)";
      tierBg = "linear-gradient(135deg, hsl(25, 45%, 28%), hsl(28, 55%, 40%))";
      break;
    case 2:
      tierName = "Silver";
      tierColor = "hsl(210, 25%, 85%)";
      tierBg = "linear-gradient(135deg, hsl(210, 20%, 35%), hsl(210, 25%, 65%))";
      break;
    case 3:
      tierName = "Gold";
      tierColor = "hsl(42, 100%, 65%)";
      tierBg = "linear-gradient(135deg, hsl(38, 85%, 35%), hsl(45, 95%, 55%))";
      break;
    case 4:
      tierName = "Prismatic";
      tierColor = "hsl(280, 100%, 80%)";
      tierBg = "linear-gradient(135deg, hsl(270, 75%, 40%), hsl(300, 90%, 65%), hsl(190, 90%, 60%))";
      break;
    default:
      tierName = "Active";
      tierColor = "hsl(215, 20%, 75%)";
      tierBg = "hsl(215, 25%, 25%)";
  }

  const iconUrl = `https://raw.communitydragon.org/latest/game/assets/ux/tft/trait_icons/${normalizedKey}.png`;

  return {
    rawName,
    cleanName,
    count,
    tierStyle,
    tierName,
    tierColor,
    tierBg,
    iconUrl
  };
}
