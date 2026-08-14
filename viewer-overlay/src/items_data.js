/**
 * Static TFT Item Dataset & Recipe Matrix
 * CommunityDragon & Data Dragon aligned identifiers
 */

const CDN_BASE = "https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/item_icons/standard/";

export const BASE_COMPONENTS = {
  BFSword: {
    id: "BFSword",
    name: "B.F. Sword",
    iconUrl: `${CDN_BASE}bf_sword.png`,
    stats: { ad: 10 },
    description: "+10% Attack Damage"
  },
  RecurveBow: {
    id: "RecurveBow",
    name: "Recurve Bow",
    iconUrl: `${CDN_BASE}recurve_bow.png`,
    stats: { as: 10 },
    description: "+10% Attack Speed"
  },
  NeedlesslyLargeRod: {
    id: "NeedlesslyLargeRod",
    name: "Needlessly Large Rod",
    iconUrl: `${CDN_BASE}needlessly_large_rod.png`,
    stats: { ap: 10 },
    description: "+10 Ability Power"
  },
  TearOfTheGoddess: {
    id: "TearOfTheGoddess",
    name: "Tear of the Goddess",
    iconUrl: `${CDN_BASE}tear_of_the_goddess.png`,
    stats: { mana: 15 },
    description: "+15 Starting Mana"
  },
  ChainVest: {
    id: "ChainVest",
    name: "Chain Vest",
    iconUrl: `${CDN_BASE}chain_vest.png`,
    stats: { armor: 20 },
    description: "+20 Armor"
  },
  NegatronCloak: {
    id: "NegatronCloak",
    name: "Negatron Cloak",
    iconUrl: `${CDN_BASE}negatron_cloak.png`,
    stats: { mr: 20 },
    description: "+20 Magic Resist"
  },
  GiantsBelt: {
    id: "GiantsBelt",
    name: "Giant's Belt",
    iconUrl: `${CDN_BASE}giants_belt.png`,
    stats: { hp: 150 },
    description: "+150 Maximum Health"
  },
  SparringGloves: {
    id: "SparringGloves",
    name: "Sparring Gloves",
    iconUrl: `${CDN_BASE}sparring_gloves.png`,
    stats: { crit: 20 },
    description: "+20% Critical Strike Chance"
  },
  Spatula: {
    id: "Spatula",
    name: "Spatula",
    iconUrl: `${CDN_BASE}spatula.png`,
    stats: {},
    description: "It must do something..."
  }
};

export const COMPLETED_ITEMS = {
  Deathblade: {
    id: "Deathblade",
    name: "Deathblade",
    recipe: ["BFSword", "BFSword"],
    iconUrl: `${CDN_BASE}deathblade.png`,
    stats: { ad: 50 },
    description: "Grant 50% Attack Damage. Attacks and Abilities deal 8% bonus physical damage."
  },
  GiantSlayer: {
    id: "GiantSlayer",
    name: "Giant Slayer",
    recipe: ["BFSword", "RecurveBow"],
    iconUrl: `${CDN_BASE}giant_slayer.png`,
    stats: { ad: 25, ap: 25, as: 10 },
    description: "Deal 25% more damage to enemies with more than 1600 maximum Health."
  },
  HextechGunblade: {
    id: "HextechGunblade",
    name: "Hextech Gunblade",
    recipe: ["BFSword", "NeedlesslyLargeRod"],
    iconUrl: `${CDN_BASE}hextech_gunblade.png`,
    stats: { ad: 15, ap: 15, omnivamp: 20 },
    description: "Grant 20% Omnivamp. Damage heals the lowest percent Health ally for the same amount."
  },
  SpearOfShojin: {
    id: "SpearOfShojin",
    name: "Spear of Shojin",
    recipe: ["BFSword", "TearOfTheGoddess"],
    iconUrl: `${CDN_BASE}spear_of_shojin.png`,
    stats: { ad: 20, ap: 20, mana: 15 },
    description: "Attacks restore 5 additional Mana."
  },
  EdgeOfNight: {
    id: "EdgeOfNight",
    name: "Edge of Night",
    recipe: ["BFSword", "ChainVest"],
    iconUrl: `${CDN_BASE}edge_of_night.png`,
    stats: { ad: 10, armor: 20 },
    description: "Once per combat at 60% Health, briefly become untargetable and shed negative effects. Then gain 15% bonus Attack Speed."
  },
  Bloodthirster: {
    id: "Bloodthirster",
    name: "Bloodthirster",
    recipe: ["BFSword", "NegatronCloak"],
    iconUrl: `${CDN_BASE}bloodthirster.png`,
    stats: { ad: 20, mr: 20, omnivamp: 20 },
    description: "Grant 20% Omnivamp. Once per combat at 40% Health, gain a 25% max Health Shield for 5 seconds."
  },
  SteraksGage: {
    id: "SteraksGage",
    name: "Sterak's Gage",
    recipe: ["BFSword", "GiantsBelt"],
    iconUrl: `${CDN_BASE}steraks_gage.png`,
    stats: { ad: 15, hp: 200 },
    description: "Once per combat at 60% Health, gain 25% max Health and 35% Attack Damage for the rest of combat."
  },
  InfinityEdge: {
    id: "InfinityEdge",
    name: "Infinity Edge",
    recipe: ["BFSword", "SparringGloves"],
    iconUrl: `${CDN_BASE}infinity_edge.png`,
    stats: { ad: 35, crit: 35 },
    description: "Abilities can critically strike. Gain 10% bonus Critical Strike Damage."
  },
  RedBuff: {
    id: "RedBuff",
    name: "Red Buff",
    recipe: ["RecurveBow", "RecurveBow"],
    iconUrl: `${CDN_BASE}red_buff.png`,
    stats: { as: 40 },
    description: "Attacks apply 1% Burn and 33% Wound to targets for 5 seconds."
  },
  GuinsoosRageblade: {
    id: "GuinsoosRageblade",
    name: "Guinsoo's Rageblade",
    recipe: ["RecurveBow", "NeedlesslyLargeRod"],
    iconUrl: `${CDN_BASE}guinsoos_rageblade.png`,
    stats: { ap: 10, as: 15 },
    description: "Attacks grant 5% stacking Attack Speed for the rest of combat."
  },
  StatikkShiv: {
    id: "StatikkShiv",
    name: "Statikk Shiv",
    recipe: ["RecurveBow", "TearOfTheGoddess"],
    iconUrl: `${CDN_BASE}statikk_shiv.png`,
    stats: { as: 15, ap: 15, mana: 15 },
    description: "Every 3rd attack unleashes chain lightning dealing 30 magic damage and 30% Shredding 4 enemies for 5 seconds."
  },
  TitansResolve: {
    id: "TitansResolve",
    name: "Titan's Resolve",
    recipe: ["RecurveBow", "ChainVest"],
    iconUrl: `${CDN_BASE}titans_resolve.png`,
    stats: { armor: 20, as: 10 },
    description: "Gain 2% Attack Damage and 2 Ability Power when attacking or taking damage, stacking up to 25 times. At max stacks, gain 20 Armor and 20 Magic Resist."
  },
  RunaansHurricane: {
    id: "RunaansHurricane",
    name: "Runaan's Hurricane",
    recipe: ["RecurveBow", "NegatronCloak"],
    iconUrl: `${CDN_BASE}runaans_hurricane.png`,
    stats: { ad: 20, as: 15, mr: 20 },
    description: "Attacks fire a bolt at a nearby enemy dealing 55% Attack Damage physical damage."
  },
  NashorsTooth: {
    id: "NashorsTooth",
    name: "Nashor's Tooth",
    recipe: ["RecurveBow", "GiantsBelt"],
    iconUrl: `${CDN_BASE}nashors_tooth.png`,
    stats: { ap: 10, as: 10, hp: 150 },
    description: "After casting an Ability, gain 40% Attack Speed for 5 seconds."
  },
  LastWhisper: {
    id: "LastWhisper",
    name: "Last Whisper",
    recipe: ["RecurveBow", "SparringGloves"],
    iconUrl: `${CDN_BASE}last_whisper.png`,
    stats: { ad: 15, as: 20, crit: 20 },
    description: "Physical damage inflicts 30% Sunder on the target for 3 seconds."
  },
  RabadonsDeathcap: {
    id: "RabadonsDeathcap",
    name: "Rabadon's Deathcap",
    recipe: ["NeedlesslyLargeRod", "NeedlesslyLargeRod"],
    iconUrl: `${CDN_BASE}rabadons_deathcap.png`,
    stats: { ap: 50 },
    description: "Grant 50 Ability Power. Gain 20% bonus magic and true damage."
  },
  ArchangelsStaff: {
    id: "ArchangelsStaff",
    name: "Archangel's Staff",
    recipe: ["NeedlesslyLargeRod", "TearOfTheGoddess"],
    iconUrl: `${CDN_BASE}archangels_staff.png`,
    stats: { ap: 20, mana: 15 },
    description: "Combat start: Gain 20 Ability Power every 5 seconds in combat."
  },
  Crownguard: {
    id: "Crownguard",
    name: "Crownguard",
    recipe: ["NeedlesslyLargeRod", "ChainVest"],
    iconUrl: `${CDN_BASE}crownguard.png`,
    stats: { ap: 20, armor: 20, hp: 100 },
    description: "Combat start: Gain a 250 Health Shield for 8 seconds. When shield expires, gain 25 Ability Power."
  },
  IonicSpark: {
    id: "IonicSpark",
    name: "Ionic Spark",
    recipe: ["NeedlesslyLargeRod", "NegatronCloak"],
    iconUrl: `${CDN_BASE}ionic_spark.png`,
    stats: { ap: 15, mr: 25, hp: 100 },
    description: "30% Shred enemies within 2 hexes. When enemies cast an Ability, zap them for magic damage equal to 160% of their max Mana."
  },
  Morellonomicon: {
    id: "Morellonomicon",
    name: "Morellonomicon",
    recipe: ["NeedlesslyLargeRod", "GiantsBelt"],
    iconUrl: `${CDN_BASE}morellonomicon.png`,
    stats: { ap: 25, hp: 150, as: 10 },
    description: "Magic or true damage from Abilities applies 1% Burn and 33% Wound for 10 seconds."
  },
  JeweledGauntlet: {
    id: "JeweledGauntlet",
    name: "Jeweled Gauntlet",
    recipe: ["NeedlesslyLargeRod", "SparringGloves"],
    iconUrl: `${CDN_BASE}jeweled_gauntlet.png`,
    stats: { ap: 35, crit: 35 },
    description: "Abilities can critically strike. Gain 10% bonus Critical Strike Damage."
  },
  BlueBuff: {
    id: "BlueBuff",
    name: "Blue Buff",
    recipe: ["TearOfTheGoddess", "TearOfTheGoddess"],
    iconUrl: `${CDN_BASE}blue_buff.png`,
    stats: { mana: 30, ad: 10, ap: 10 },
    description: "Reduce max Mana by 10. Takedowns grant 8% bonus damage for 8 seconds."
  },
  ProtectorsVow: {
    id: "ProtectorsVow",
    name: "Protector's Vow",
    recipe: ["TearOfTheGoddess", "ChainVest"],
    iconUrl: `${CDN_BASE}protectors_vow.png`,
    stats: { armor: 20, mana: 30 },
    description: "Once per combat at 40% Health, gain a 25% max Health Shield for 5 seconds and 20 Armor and Magic Resist."
  },
  AdaptiveHelm: {
    id: "AdaptiveHelm",
    name: "Adaptive Helm",
    recipe: ["TearOfTheGoddess", "NegatronCloak"],
    iconUrl: `${CDN_BASE}adaptive_helm.png`,
    stats: { mana: 15, ap: 15, mr: 20 },
    description: "Front 2 rows: Gain 35 Armor and Magic Resist. Back 2 rows: Gain 20 Ability Power and 10 Mana every 3 seconds."
  },
  Redemption: {
    id: "Redemption",
    name: "Redemption",
    recipe: ["TearOfTheGoddess", "GiantsBelt"],
    iconUrl: `${CDN_BASE}redemption.png`,
    stats: { hp: 150, mana: 15 },
    description: "Heal adjacent allies for 15% of their missing Health every 5 seconds. Reduce AoE damage taken by 10%."
  },
  HandOfJustice: {
    id: "HandOfJustice",
    name: "Hand of Justice",
    recipe: ["TearOfTheGoddess", "SparringGloves"],
    iconUrl: `${CDN_BASE}hand_of_justice.png`,
    stats: { mana: 15, crit: 20 },
    description: "Grant 15% Attack Damage, 15 Ability Power, and 10% Omnivamp. Double one of these effects each combat."
  },
  BrambleVest: {
    id: "BrambleVest",
    name: "Bramble Vest",
    recipe: ["ChainVest", "ChainVest"],
    iconUrl: `${CDN_BASE}bramble_vest.png`,
    stats: { armor: 55 },
    description: "Gain 5% max Health. Take 8% reduced damage from attacks. When hit by any attack, deal 100 magic damage to all adjacent enemies."
  },
  GargoyleStoneplate: {
    id: "GargoyleStoneplate",
    name: "Gargoyle Stoneplate",
    recipe: ["ChainVest", "NegatronCloak"],
    iconUrl: `${CDN_BASE}gargoyle_stoneplate.png`,
    stats: { armor: 30, mr: 30, hp: 100 },
    description: "Gain 10 Armor and 10 Magic Resist for each enemy targeting the wearer."
  },
  SunfireCape: {
    id: "SunfireCape",
    name: "Sunfire Cape",
    recipe: ["ChainVest", "GiantsBelt"],
    iconUrl: `${CDN_BASE}sunfire_cape.png`,
    stats: { armor: 20, hp: 250 },
    description: "Every 2 seconds, an enemy within 2 hexes is Burned for 1% max Health true damage per second and Wounded for 10 seconds."
  },
  SteadfastHeart: {
    id: "SteadfastHeart",
    name: "Steadfast Heart",
    recipe: ["ChainVest", "SparringGloves"],
    iconUrl: `${CDN_BASE}steadfast_heart.png`,
    stats: { armor: 25, crit: 20, hp: 200 },
    description: "Take 8% reduced damage. While above 50% Health, take 15% reduced damage instead."
  },
  DragonsClaw: {
    id: "DragonsClaw",
    name: "Dragon's Claw",
    recipe: ["NegatronCloak", "NegatronCloak"],
    iconUrl: `${CDN_BASE}dragons_claw.png`,
    stats: { mr: 65 },
    description: "Gain 9% max Health. Every 2 seconds, heal 2.5% max Health."
  },
  Evenshroud: {
    id: "Evenshroud",
    name: "Evenshroud",
    recipe: ["NegatronCloak", "GiantsBelt"],
    iconUrl: `${CDN_BASE}evenshroud.png`,
    stats: { mr: 20, hp: 150 },
    description: "30% Sunder enemies within 2 hexes. Gain 25 Armor and Magic Resist for the first 15 seconds of combat."
  },
  Quicksilver: {
    id: "Quicksilver",
    name: "Quicksilver",
    recipe: ["NegatronCloak", "SparringGloves"],
    iconUrl: `${CDN_BASE}quicksilver.png`,
    stats: { mr: 20, crit: 20, as: 20 },
    description: "Combat start: Immune to crowd control for 14 seconds. During this time, gain 2% Attack Speed every 2 seconds."
  },
  WarmogsArmor: {
    id: "WarmogsArmor",
    name: "Warmog's Armor",
    recipe: ["GiantsBelt", "GiantsBelt"],
    iconUrl: `${CDN_BASE}warmogs_armor.png`,
    stats: { hp: 600 },
    description: "Gain 600 bonus Health and 12% max Health."
  },
  Guardbreaker: {
    id: "Guardbreaker",
    name: "Guardbreaker",
    recipe: ["GiantsBelt", "SparringGloves"],
    iconUrl: `${CDN_BASE}guardbreaker.png`,
    stats: { hp: 150, crit: 20, ap: 10, ad: 10 },
    description: "After damaging a shielded enemy, gain 25% bonus damage for 3 seconds."
  },
  ThiefsGloves: {
    id: "ThiefsGloves",
    name: "Thief's Gloves",
    recipe: ["SparringGloves", "SparringGloves"],
    iconUrl: `${CDN_BASE}thiefs_gloves.png`,
    stats: { crit: 20, hp: 150 },
    description: "Each round: Equip 2 random items based on your Level."
  }
};
