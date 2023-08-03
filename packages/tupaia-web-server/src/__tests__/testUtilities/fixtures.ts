/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export interface Entity {
  code: string;
  name: string;
  type: string;
  country_code?: string;
  attributes: { type?: string };
}

export interface Relation {
  parent: string;
  child: string;
  hierarchy?: string;
}

export const PROJECTS = [
  {
    code: 'oracleages',
    permission_groups: ['Public'],
    projectEntityName: 'Oracle of Ages',
  },
  {
    code: 'oracleseasons',
    permission_groups: ['Public'],
    projectEntityName: 'Oracle of Seasons',
  },
];

export const ENTITIES: Entity[] = [
  {
    code: 'oracleages',
    name: 'Oracle of Ages',
    type: 'project',
    attributes: {},
  },
  {
    code: 'oracleseasons',
    name: 'Oracle of Seasons',
    type: 'project',
    attributes: {},
  },
  // Country -> District -> Facility
  {
    country_code: 'LABRYNNA',
    code: 'LABRYNNA',
    name: 'Labrynna',
    type: 'country',
    attributes: {},
  },
  ...[
    { code: 'YOLLS', name: 'Yolls Graveyard' },
    { code: 'DEKU', name: 'Deku Forest' },
    { code: 'CRESCENT', name: 'Crescent Island' },
    { code: 'SYMMETRY', name: 'Symmetry Village' },
    { code: 'RIDGE', name: 'Rolling Ridge' },
    { code: 'ZORAS', name: 'Zoras Domain' },
    { code: 'NORETURN', name: 'Sea of No Return' },
  ].map(({ code, name }) => ({
    country_code: 'LABRYNNA',
    code,
    name,
    type: 'district',
    attributes: {},
  })),
  ...[
    { code: 'SPIRITS', name: 'Spirits Grave' },
    { code: 'WING', name: 'Wing Dungeon' },
    { code: 'MOONLIT', name: 'Moonlit Grotto' },
    { code: 'SKULL', name: 'Skull Dungeon' },
    { code: 'CROWN', name: 'Crown Dungeon' },
    { code: 'MERMAIDS', name: 'Mermaids Cave' },
    { code: 'JABU', name: 'Jabu Jabus Belly' },
    { code: 'TOMB', name: 'Ancient Tomb' },
  ].map(({ code, name }) => ({
    country_code: 'LABRYNNA',
    code,
    name,
    type: 'facility',
    attributes: { type: 'dungeon' },
  })),

  {
    country_code: 'HOLODRUM',
    code: 'HOLODRUM',
    name: 'Holodrum',
    type: 'country',
    attributes: {},
  },
  // Horon -> Gnarled Root
  // Woods of Winter -> Snakes Remains
  // Spool Swamp -> Poison Moths Lair
  // Mt Cucco -> Dancing Dragon Dungeon
  // Eyeglass Lake -> Unicorns Cave
  // Tarm Ruins -> Ancient Ruins
  // Holodrum Graveyard -> Explorers Crypt
  // Subrosia -> Sword & Shield Maze
  ...[
    { code: 'HORON', name: 'Horon' },
    { code: 'WINTER', name: 'Woods of Winter' },
    { code: 'SPOOL', name: 'Spool Swamp' },
    { code: 'CUCCO', name: 'Mount Cucco' },
    { code: 'EYEGLASS', name: 'Eyeglass Lake' },
    { code: 'TARM', name: 'Tarm Ruins' },
    { code: 'GRAVE', name: 'Holodrum Graveyard' },
    { code: 'SUBROSIA', name: 'Subrosia' },
  ].map(({ code, name }) => ({
    country_code: 'HOLODRUM',
    code,
    name,
    type: 'district',
    attributes: {},
  })),
  ...[
    { code: 'GNARLED', name: 'Gnarled Root' },
    { code: 'SNAKES', name: 'Snakes Remains' },
    { code: 'MOTHS', name: 'Poison Moths Lair' },
    { code: 'DRAGON', name: 'Dancing Dragon Dungeon' },
    { code: 'EYEGLASS', name: 'Eyeglass Lake' },
    { code: 'RUINS', name: 'Ancient Ruins' },
    { code: 'EXPLORERS', name: 'Explorers Crypt' },
    { code: 'SUBROSIA', name: 'Sword & Shield Maze' },
  ].map(({ code, name }) => ({
    country_code: 'HOLODRUM',
    code,
    name,
    type: 'facility',
    attributes: { type: 'dungeon' },
  })),
];

export const ENTITY_RELATIONS: Record<string, Relation[]> = {
  oracleages: [
    { parent: 'oracleages', child: 'LABRYNNA', hierarchy: 'oracleages' },
    { parent: 'LABRYNNA', child: 'YOLLS', hierarchy: 'oracleages' },
    { parent: 'LABRYNNA', child: 'DEKU', hierarchy: 'oracleages' },
    { parent: 'LABRYNNA', child: 'CRESCENT', hierarchy: 'oracleages' },
    { parent: 'LABRYNNA', child: 'SYMMETRY', hierarchy: 'oracleages' },
    { parent: 'LABRYNNA', child: 'RIDGE', hierarchy: 'oracleages' },
    { parent: 'LABRYNNA', child: 'ZORAS', hierarchy: 'oracleages' },
    { parent: 'LABRYNNA', child: 'NORETURN', hierarchy: 'oracleages' },
    { parent: 'YOLLS', child: 'SPIRITS', hierarchy: 'oracleages' },
    { parent: 'DEKU', child: 'WING', hierarchy: 'oracleages' },
    { parent: 'CRESCENT', child: 'MOONLIT', hierarchy: 'oracleages' },
    { parent: 'SYMMETRY', child: 'SKULL', hierarchy: 'oracleages' },
    { parent: 'RIDGE', child: 'CROWN', hierarchy: 'oracleages' },
    { parent: 'RIDGE', child: 'MERMAIDS', hierarchy: 'oracleages' },
    { parent: 'ZORAS', child: 'JABU', hierarchy: 'oracleages' },
    { parent: 'NORETURN', child: 'TOMB', hierarchy: 'oracleages' },
  ],

  oracleseasons: [
    { parent: 'oracleseasons', child: 'HOLODRUM', hierarchy: 'oracleseasons' },
    { parent: 'HOLODRUM', child: 'HORON', hierarchy: 'oracleseasons' },
    { parent: 'HOLODRUM', child: 'WINTER', hierarchy: 'oracleseasons' },
    { parent: 'HOLODRUM', child: 'SPOOL', hierarchy: 'oracleseasons' },
    { parent: 'HOLODRUM', child: 'CUCCO', hierarchy: 'oracleseasons' },
    { parent: 'HOLODRUM', child: 'EYEGLASS', hierarchy: 'oracleseasons' },
    { parent: 'HOLODRUM', child: 'TARM', hierarchy: 'oracleseasons' },
    { parent: 'HOLODRUM', child: 'GRAVE', hierarchy: 'oracleseasons' },
    { parent: 'HOLODRUM', child: 'SUBROSIA', hierarchy: 'oracleseasons' },
    { parent: 'HORON', child: 'GNARLED', hierarchy: 'oracleseasons' },
    { parent: 'WINTER', child: 'SNAKES', hierarchy: 'oracleseasons' },
    { parent: 'SPOOL', child: 'MOTHS', hierarchy: 'oracleseasons' },
    { parent: 'CUCCO', child: 'DRAGON', hierarchy: 'oracleseasons' },
    { parent: 'EYEGLASS', child: 'EYEGLASS', hierarchy: 'oracleseasons' },
    { parent: 'TARM', child: 'RUINS', hierarchy: 'oracleseasons' },
    { parent: 'GRAVE', child: 'EXPLORERS', hierarchy: 'oracleseasons' },
    { parent: 'SUBROSIA', child: 'SUBROSIA', hierarchy: 'oracleseasons' },
  ],
};
