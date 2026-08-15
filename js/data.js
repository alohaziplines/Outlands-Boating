/* ==========================================================================
   Outlands Boating — game data
   Sourced from wiki.uooutlands.com (Ships, Ship Upgrades, Ship Crewmembers)
   All bonus values are percentages unless noted (fsh, spy are flat points).
   ========================================================================== */

const SHIPS = [
  { id: "small",        name: "Small Ship",         maxCrew: 2, hull: 2000, sail: 1800, gun: 1800, cannons: 2, speed: 6.25,  wake: 50,  reg: 0,       upgradeMult: 1 },
  { id: "small-dragon",  name: "Small Dragonship",   maxCrew: 2, hull: 2000, sail: 1800, gun: 1800, cannons: 2, speed: 6.25,  wake: 50,  reg: 0,       upgradeMult: 1 },
  { id: "medium",        name: "Medium Ship",        maxCrew: 3, hull: 3000, sail: 2700, gun: 2700, cannons: 3, speed: 5.556, wake: 75,  reg: 10000,   upgradeMult: 2 },
  { id: "medium-dragon",  name: "Medium Dragonship",  maxCrew: 3, hull: 3000, sail: 2700, gun: 2700, cannons: 3, speed: 5.556, wake: 75,  reg: 10000,   upgradeMult: 2 },
  { id: "large",        name: "Large Ship",         maxCrew: 4, hull: 4000, sail: 3600, gun: 3600, cannons: 4, speed: 5,     wake: 100, reg: 50000,   upgradeMult: 3 },
  { id: "large-dragon",  name: "Large Dragonship",   maxCrew: 4, hull: 4000, sail: 3600, gun: 3600, cannons: 4, speed: 5,     wake: 100, reg: 50000,   upgradeMult: 3 },
  { id: "carrack",       name: "Carrack",            maxCrew: 5, hull: 5000, sail: 4500, gun: 4500, cannons: 5, speed: 4.545, wake: 150, reg: 125000,  upgradeMult: 4 },
  { id: "galleon",       name: "Galleon",            maxCrew: 6, hull: 6000, sail: 5400, gun: 5400, cannons: 6, speed: 4.167, wake: 200, reg: 250000,  upgradeMult: 5 },
  { id: "longship",      name: "Longship",           maxCrew: 8, hull: 6000, sail: 5400, gun: 5400, cannons: 4, speed: 3.846, wake: 200, reg: 500000,  upgradeMult: 6 },
  { id: "sotl",          name: "Ship of the Line",   maxCrew: 7, hull: 7000, sail: 6300, gun: 6300, cannons: 7, speed: 3.517, wake: 250, reg: 750000,  upgradeMult: 7 }
];

// Stat keys shared across upgrades & crew:
// hull, sail, gun  -> % bonus to max HP
// spd  -> % movement speed bonus
// acc  -> % cannon accuracy bonus
// dmg  -> % cannon damage bonus
// rld  -> % reload speed increase
// tid  -> % tidings bonus
// lsr, reg, grt -> % ability cooldown reduction (lesser/regular/greater)
// rpr  -> % repair cooldown reduction
// huRp, saRp, guRp -> % repair amount bonus (hull/sail/guns)
// brd  -> % boarding success chance bonus
// dbl  -> % doubloons earned bonus
// crHt -> % crew hit points increase
// brav -> % crew bravery bonus
// crDmg -> % crew damage bonus
// heal -> % bonus healing to crewmembers
// fsh  -> flat effective fishing skill bonus
// spy  -> flat spyglass distance bonus
// wake -> % wake scalar reduction (lower wake = stealthier)

const OUTFITTINGS = [
  { id: "destroyer",   name: "Destroyer",   stats: { hull: 10, sail: 20, gun: 40, acc: 10, dmg: 15, rld: 50, grt: 5, rpr: 10, guRp: 50 } },
  { id: "dreadnought", name: "Dreadnought", stats: { hull: 20, sail: 40, gun: 40, dmg: 10, grt: 5, rpr: 15, huRp: 50, brd: 50, brav: 20, crDmg: 10, heal: 30 } },
  { id: "explorer",    name: "Explorer",    stats: { sail: 40, spd: 5, rld: 25, tid: 15, lsr: 5, rpr: 15, dbl: 10, heal: 7.5, fsh: 5, spy: 20, wake: 10 } },
  { id: "fisherman",   name: "Fisherman",   stats: { hull: 20, sail: 40, spd: 2.5, grt: 5, rpr: 10, saRp: 50, dbl: 10, fsh: 15, spy: 5, wake: 10 } },
  { id: "merchant",    name: "Merchant",    stats: { hull: 10, sail: 20, spd: 2.5, tid: 10, lsr: 5, rpr: 5, dbl: 15, crHt: 15, heal: 22.5, wake: 10 } },
  { id: "privateer",   name: "Privateer",   stats: { sail: 20, gun: 20, spd: 5, acc: 7.5, lsr: 5, reg: 5, grt: 5, brd: 50, dbl: 10, brav: 20, spy: 10 } },
  { id: "raider",      name: "Raider",      stats: { hull: 20, sail: 40, spd: 5, reg: 5, brd: 50, dbl: 5, crHt: 20, brav: 30, crDmg: 15, heal: 7.5 } },
  { id: "runner",      name: "Runner",      stats: { sail: 40, spd: 7.5, rld: 50, lsr: 5, rpr: 15, saRp: 50, heal: 15, spy: 5 } },
  { id: "sentry",      name: "Sentry",      stats: { hull: 10, sail: 20, gun: 20, spd: 5, acc: 5, lsr: 5, reg: 5, grt: 5, spy: 7.5, wake: 7.5 } },
  { id: "skirmisher",  name: "Skirmisher",  stats: { acc: 2.5, rld: 20, lsr: 10, reg: 10, grt: 10, crHt: 15, heal: 22.5, wake: 12.5 } }
];

const SPECIALTY_ITEMS = [
  { id: "custom-rigging",       name: "Custom Rigging",       stats: { sail: 20, spd: 5 } },
  { id: "exceptional-oars",     name: "Exceptional Oars",     stats: { spd: 7.5 } },
  { id: "storage-lockers",      name: "Storage Lockers",      stats: { tid: 15, dbl: 5 } },
  { id: "cannon-targets",       name: "Cannon Targets",       stats: { acc: 7.5, dmg: 2.5, rld: 20 } },
  { id: "routine-maintenance",  name: "Routine Maintenance",  stats: { hull: 5, sail: 10, gun: 10, spd: 1, rld: 25, rpr: 10, huRp: 25, saRp: 25, guRp: 25 } },
  { id: "fearsome-totem",       name: "Fearsome Totem",       stats: { spd: 1, grt: 5, brd: 50, brav: 30, crDmg: 10 } },
  { id: "tavern-connections",   name: "Tavern Connections",   stats: { brd: 50, crHt: 20, brav: 20, crDmg: 10, heal: 15, fsh: 5, spy: 5 } },
  { id: "carpentry-station",    name: "Carpentry Station",    stats: { hull: 10, rld: 25, rpr: 15, huRp: 50, saRp: 25, guRp: 25 } },
  { id: "sewing-station",       name: "Sewing Station",       stats: { sail: 20, spd: 1, rld: 25, rpr: 15, huRp: 25, saRp: 50, guRp: 25 } },
  { id: "gunsmithing-station",  name: "Gunsmithing Station",  stats: { gun: 20, rld: 50, rpr: 15, huRp: 25, saRp: 25, guRp: 50 } },
  { id: "galley-station",       name: "Galley Station",       stats: { spd: 2.5, crHt: 25, heal: 22.5, fsh: 5 } },
  { id: "mongbat-figurehead",   name: "Mongbat Figurehead",   stats: { lsr: 10, reg: 5, grt: 5 } },
  { id: "eagle-figurehead",     name: "Eagle Figurehead",     stats: { lsr: 5, reg: 10, grt: 5 } },
  { id: "gorgon-figurehead",    name: "Gorgon Figurehead",    stats: { lsr: 5, reg: 5, grt: 10 } },
  { id: "exceptional-powder",   name: "Exceptional Powder",   stats: { acc: 2.5, dmg: 10, reg: 5 } },
  { id: "stacked-powderkegs",   name: "Stacked Powderkegs",   stats: { dmg: 5, rld: 50, tid: 5, lsr: 5 } },
  { id: "smoothbore-cannonshot", name: "Smoothbore Cannonshot", stats: { acc: 5, dmg: 5, rld: 25, reg: 5 } },
  { id: "auxiliary-cannons",    name: "Auxiliary Cannons",    stats: { dmg: 7.5, lsr: 5 } },
  { id: "exotic-bait",          name: "Exotic Bait",          stats: { crHt: 10, fsh: 10, spy: 5 } },
  { id: "pristine-lumber",      name: "Pristine Lumber",      stats: { hull: 20, rld: 25, tid: 2.5, rpr: 5, huRp: 25 } },
  { id: "exquisite-cloth",      name: "Exquisite Cloth",      stats: { sail: 40, spd: 2.5, rld: 25, rpr: 5, saRp: 25 } },
  { id: "flawless-iron",        name: "Flawless Iron",        stats: { gun: 40, acc: 2.5, dmg: 2.5, rld: 25, rpr: 5, guRp: 25 } },
  { id: "powder-carts",         name: "Powder Carts",         stats: { dmg: 5, rld: 50, tid: 2.5, lsr: 2.5, reg: 2.5, grt: 2.5 } },
  { id: "accurate-maps",        name: "Accurate Maps",        stats: { spd: 5, dbl: 2.5 } },
  { id: "navigation-chart",     name: "Navigation Chart",     stats: { spd: 5, grt: 2.5, wake: 5 } },
  { id: "exquisite-globe",      name: "Exquisite Globe",      stats: { spd: 5, wake: 10 } },
  { id: "shipping-contracts",   name: "Shipping Contracts",   stats: { dbl: 15 } },
  { id: "luxury-goods",         name: "Luxury Goods",         stats: { spd: 0, dbl: 12.5, crHt: 5, heal: 7.5 } },
  { id: "livestock",            name: "Livestock",            stats: { dbl: 10, crHt: 10, heal: 15 } },
  { id: "grain-shipment",       name: "Grain Shipment",       stats: { dbl: 10, crHt: 15, heal: 5 } },
  { id: "crows-nest",           name: "Crow's Nest",          stats: { acc: 2.5, reg: 5, spy: 20 } },
  { id: "weathervane",          name: "Weathervane",          stats: { spd: 5, spy: 5, wake: 5 } },
  { id: "telescope",            name: "Telescope",            stats: { spd: 2.5, spy: 10, wake: 10 } },
  { id: "signal-pigeons",       name: "Signal Pigeons",       stats: { lsr: 5, reg: 5, grt: 5, wake: 10 } },
  { id: "blast-furnace",        name: "Blast Furnace",        stats: { dmg: 5, rld: 50, reg: 5, rpr: 25 } }
];

const CREW_SUPPLIES = [
  { id: "boarding-knives",      name: "Boarding Knives",      stats: { brd: 100, brav: 60, crDmg: 5 } },
  { id: "heavy-weaponry",       name: "Heavy Weaponry",       stats: { brav: 20, crDmg: 25 } },
  { id: "medium-weaponry",      name: "Medium Weaponry",      stats: { brd: 25, brav: 30, crDmg: 20 } },
  { id: "light-weaponry",       name: "Light Weaponry",       stats: { brd: 50, brav: 40, crDmg: 15 } },
  { id: "practice-targets",     name: "Practice Targets",     stats: { lsr: 5, brav: 20, crDmg: 10 } },
  { id: "silk-hammocks",        name: "Silk Hammocks",        stats: { spd: 1, lsr: 2.5, reg: 2.5, grt: 2.5, dbl: 2.5, heal: 30 } },
  { id: "fur-bedrolls",         name: "Fur Bedrolls",         stats: { spd: 1, lsr: 2.5, reg: 2.5, grt: 2.5, heal: 45 } },
  { id: "stockade",             name: "Stockade",             stats: { spd: 2.5, brd: 50, crDmg: 15 } },
  { id: "bananas",              name: "Bananas",              stats: { spd: 1, lsr: 2.5, reg: 2.5, grt: 2.5, dbl: 2.5, crHt: 10, heal: 15 } },
  { id: "limes",                name: "Limes",                stats: { spd: 1, lsr: 2.5, reg: 2.5, grt: 2.5, dbl: 2.5, crHt: 15, heal: 7.5 } },
  { id: "delicious-rations",    name: "Delicious Rations",    stats: { spd: 2.5, crHt: 20, heal: 22.5 } },
  { id: "savory-rations",       name: "Savory Rations",       stats: { spd: 2.5, crHt: 25, heal: 15 } },
  { id: "healthy-rations",      name: "Healthy Rations",      stats: { spd: 2.5, crHt: 30, heal: 7.5 } },
  { id: "wild-game",            name: "Wild Game",            stats: { spd: 1, lsr: 2.5, reg: 2.5, grt: 2.5, dbl: 2.5, crHt: 15, fsh: 5, spy: 5 } },
  { id: "hardtack",             name: "Hardtack",             stats: { spd: 1, lsr: 2.5, reg: 2.5, grt: 2.5, brd: 50, crHt: 15, brav: 5, crDmg: 5, heal: 7.5 } },
  { id: "hookah",               name: "Hookah",                stats: { lsr: 2.5, reg: 2.5, grt: 5, heal: 30, fsh: 5 } },
  { id: "medical-supplies",     name: "Medical Supplies",     stats: { lsr: 2.5, reg: 2.5, grt: 2.5, dbl: 2.5, crHt: 10, heal: 22.5 } },
  { id: "alchemical-supplies",  name: "Alchemical Supplies",  stats: { lsr: 2.5, reg: 2.5, grt: 2.5, dbl: 5, crHt: 5, heal: 15 } },
  { id: "spices",               name: "Spices",                stats: { spd: 1, lsr: 2.5, reg: 2.5, grt: 2.5, dbl: 7.5 } },
  { id: "ale-supply",           name: "Ale Supply",           stats: { spd: 1, lsr: 2.5, reg: 2.5, grt: 2.5, brd: 25, brav: 25, crDmg: 10, heal: 7.5, fsh: 5 } },
  { id: "smoke-bombs",          name: "Smoke Bombs",          stats: { lsr: 2.5, reg: 5, grt: 2.5, brd: 25, wake: 10 } },
  { id: "intercepted-orders",   name: "Intercepted Orders",   stats: { spd: 2.5, spy: 5, wake: 5 } },
  { id: "crew-hatches",         name: "Crew Hatches",         stats: { spd: 1, lsr: 5, reg: 5, grt: 2.5, wake: 5 } },
  { id: "dueling-rapiers",      name: "Dueling Rapiers",      stats: { brd: 75, brav: 50, crDmg: 10 } }
];

// Crew ranks — pipCap = number of bonus pips this rank can allocate.
const CREW_RANKS = [
  { id: 1, name: "Novice",    cost: 600,   pipCap: 1, hp: 0,  dmg: 0,  wrestling: 0 },
  { id: 2, name: "Adept",     cost: 700,   pipCap: 2, hp: 5,  dmg: 4,  wrestling: 3 },
  { id: 3, name: "Veteran",   cost: 600,   pipCap: 3, hp: 10, dmg: 8,  wrestling: 6 },
  { id: 4, name: "Expert",    cost: 900,   pipCap: 4, hp: 15, dmg: 12, wrestling: 9 },
  { id: 5, name: "Master",    cost: 1000,  pipCap: 5, hp: 20, dmg: 16, wrestling: 12 },
  { id: 6, name: "Heroic",    cost: 10000, pipCap: 6, hp: 25, dmg: 20, wrestling: 15 },
  { id: 7, name: "Legendary", cost: 25000, pipCap: 7, hp: 30, dmg: 24, wrestling: 18 }
];

// Crew professions — each bonus stat lists the amount granted per pip.
const PROFESSIONS = [
  { id: "carpenter",    name: "Carpenter",     bonuses: [ { stat: "rpr",  perPip: 2 },  { stat: "huRp", perPip: 2 },  { stat: "hull", perPip: 1 } ] },
  { id: "hedgemage",    name: "Hedge Mage",    bonuses: [ { stat: "wake", perPip: 0.75 }, { stat: "crHt", perPip: 2 }, { stat: "grt", perPip: 1 } ] },
  { id: "navigator",    name: "Navigator",     bonuses: [ { stat: "spd",  perPip: 0.5 }, { stat: "sail", perPip: 2 },  { stat: "saRp", perPip: 4 } ] },
  { id: "powdermonkey", name: "Powder Monkey", bonuses: [ { stat: "rld",  perPip: 3 },   { stat: "dmg",  perPip: 0.5 }, { stat: "reg", perPip: 1 } ] },
  { id: "cook",         name: "Cook",          bonuses: [ { stat: "crHt", perPip: 2 },  { stat: "brav", perPip: 1.5 }, { stat: "crDmg", perPip: 0.5 }, { stat: "heal", perPip: 3 } ] },
  { id: "marine",       name: "Marine",        bonuses: [ { stat: "brd",  perPip: 4 },  { stat: "brav", perPip: 1.5 }, { stat: "crDmg", perPip: 0.5 } ] },
  { id: "orcreaver",    name: "Orc Reaver",    bonuses: [ { stat: "crDmg", perPip: 0.5 }, { stat: "brav", perPip: 1.5 }, { stat: "brd", perPip: 4 } ] },
  { id: "raider",       name: "Raider",        bonuses: [ { stat: "brav", perPip: 1.5 }, { stat: "brd", perPip: 4 },   { stat: "crDmg", perPip: 0.5 } ] },
  { id: "engineer",     name: "Engineer",      bonuses: [ { stat: "lsr", perPip: 1 }, { stat: "reg", perPip: 1 }, { stat: "grt", perPip: 1 }, { stat: "rld", perPip: 3 }, { stat: "dmg", perPip: 0.5 }, { stat: "rpr", perPip: 2 } ] },
  { id: "marksman",     name: "Marksman",      bonuses: [ { stat: "acc", perPip: 0.5 }, { stat: "dmg", perPip: 0.5 }, { stat: "brav", perPip: 1.5 } ] },
  { id: "paviseman",    name: "Paviseman",     bonuses: [ { stat: "crHt", perPip: 2 }, { stat: "acc", perPip: 0.5 }, { stat: "dbl", perPip: 0.5 } ] },
  { id: "sailor",       name: "Sailor",        bonuses: [ { stat: "spd", perPip: 0.5 }, { stat: "sail", perPip: 2 }, { stat: "saRp", perPip: 4 }, { stat: "acc", perPip: 0.5 } ] },
  { id: "fisherman",    name: "Fisherman",     bonuses: [ { stat: "fsh", perPip: 0.2 }, { stat: "dbl", perPip: 0.5 }, { stat: "sail", perPip: 2 }, { stat: "saRp", perPip: 4 } ] },
  { id: "medic",        name: "Medic",         bonuses: [ { stat: "heal", perPip: 3 }, { stat: "crHt", perPip: 2 } ] },
  { id: "pilgrim",      name: "Pilgrim",       bonuses: [ { stat: "wake", perPip: 0.75 }, { stat: "fsh", perPip: 0.2 }, { stat: "spd", perPip: 0.5 } ] },
  { id: "seadog",       name: "Sea Dog",       bonuses: [ { stat: "dbl", perPip: 0.5 }, { stat: "spd", perPip: 0.5 }, { stat: "brav", perPip: 1.5 }, { stat: "sail", perPip: 2 } ] },
  { id: "gunner",       name: "Gunner",        bonuses: [ { stat: "dmg", perPip: 0.5 }, { stat: "acc", perPip: 0.5 }, { stat: "rld", perPip: 3 }, { stat: "gun", perPip: 2 }, { stat: "guRp", perPip: 4 } ] },
  { id: "merchant",     name: "Merchant",      bonuses: [ { stat: "dbl", perPip: 0.5 }, { stat: "tid", perPip: 0.5 }, { stat: "spd", perPip: 0.5 } ] },
  { id: "pirate",       name: "Pirate",        bonuses: [ { stat: "brd", perPip: 4 }, { stat: "dbl", perPip: 0.5 }, { stat: "dmg", perPip: 0.5 }, { stat: "crDmg", perPip: 0.5 } ] },
  { id: "spy",          name: "Spy",           bonuses: [ { stat: "wake", perPip: 0.75 }, { stat: "tid", perPip: 0.5 }, { stat: "lsr", perPip: 1 } ] }
];

// Display metadata for every stat key: label + unit
const STAT_META = {
  hull:  { label: "Hull HP",              unit: "pct", group: "hull" },
  sail:  { label: "Sail HP",              unit: "pct", group: "hull" },
  gun:   { label: "Gun HP",               unit: "pct", group: "hull" },
  spd:   { label: "Speed",                unit: "pct", group: "sailing" },
  wake:  { label: "Wake (stealth)",       unit: "wake", group: "sailing" },
  acc:   { label: "Cannon Accuracy",      unit: "pct", group: "combat" },
  dmg:   { label: "Cannon Damage",        unit: "pct", group: "combat" },
  rld:   { label: "Cannon Reload Speed",  unit: "pct", group: "combat" },
  brd:   { label: "Boarding Chance",      unit: "pct", group: "combat" },
  lsr:   { label: "Lesser Ability CD",    unit: "pct", group: "abilities" },
  reg:   { label: "Regular Ability CD",   unit: "pct", group: "abilities" },
  grt:   { label: "Greater Ability CD",   unit: "pct", group: "abilities" },
  rpr:   { label: "Repair Cooldown",      unit: "pct", group: "repair" },
  huRp:  { label: "Hull Repair Amount",   unit: "pct", group: "repair" },
  saRp:  { label: "Sail Repair Amount",   unit: "pct", group: "repair" },
  guRp:  { label: "Gun Repair Amount",    unit: "pct", group: "repair" },
  crHt:  { label: "Crew Hit Points",      unit: "pct", group: "crew" },
  brav:  { label: "Crew Bravery",         unit: "pct", group: "crew" },
  crDmg: { label: "Crew Damage",          unit: "pct", group: "crew" },
  heal:  { label: "Crew Healing",         unit: "pct", group: "crew" },
  tid:   { label: "Tidings",              unit: "pct", group: "economy" },
  dbl:   { label: "Doubloons Earned",     unit: "pct", group: "economy" },
  fsh:   { label: "Effective Fishing",    unit: "flat", group: "economy" },
  spy:   { label: "Spyglass Distance",    unit: "flat", group: "economy" }
};

const ALL_STAT_KEYS = Object.keys(STAT_META);
