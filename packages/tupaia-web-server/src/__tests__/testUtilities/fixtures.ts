/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
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

export const DEFAULT_ACCESS_POLICY = {
  DL: ['Public'],
  TO: ['Public'],
};

export const PROJECTS = [
  {
    code: 'redblue',
    permission_groups: ['Public'],
    projectEntityName: 'Pokemon Red/Blue',
  },
  {
    code: 'goldsilver',
    permission_groups: ['Public'],
    projectEntityName: 'Pokemon Gold/Silver',
  },
];

export const COUNTRIES = ['DL', 'TO'];

export const ENTITIES: Entity[] = [
  {
    code: 'redblue',
    name: 'Pokemon Red/Blue',
    type: 'project',
    attributes: {},
  },
  {
    code: 'goldsilver',
    name: 'Pokemon Gold/Silver',
    type: 'project',
    attributes: {},
  },
  // country -> city    -> facility
  //                    -> individual
  //         -> village -> individual
  { country_code: 'DL', code: 'DL', name: 'DL', type: 'country', attributes: {} },
  { country_code: 'DL', code: 'PALLET', name: 'Pallet Town', type: 'village', attributes: {} },
  {
    country_code: 'DL',
    code: 'VIRIDIAN',
    name: 'Viridian City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  {
    country_code: 'DL',
    code: 'PEWTER',
    name: 'Pewter City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  {
    country_code: 'DL',
    code: 'CERULEAN',
    name: 'Cerulean City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  {
    country_code: 'DL',
    code: 'CERULEAN_CAVE',
    name: 'Cerulean Cave',
    type: 'facility',
    attributes: {},
  },
  {
    country_code: 'DL',
    code: 'VERMILLION',
    name: 'Vermillion City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  { country_code: 'DL', code: 'LAVENDER', name: 'Lavender Town', type: 'city', attributes: {} },
  {
    country_code: 'DL',
    code: 'PKMN_TOWER',
    name: 'Pokemon Tower',
    type: 'facility',
    attributes: {},
  },
  {
    country_code: 'DL',
    code: 'LAVENDER_RADIO_TOWER',
    name: 'Lavender Radio Tower',
    type: 'facility',
    attributes: {},
  },
  {
    country_code: 'DL',
    code: 'CELADON',
    name: 'Celadon City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  {
    country_code: 'DL',
    code: 'CELADON_GAME',
    name: 'Celadon Game Corner',
    type: 'facility',
    attributes: {},
  },
  {
    country_code: 'DL',
    code: 'FUCHSIA',
    name: 'Fuchsia City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  { country_code: 'DL', code: 'SAFARI', name: 'Safari Zone', type: 'facility', attributes: {} },
  {
    country_code: 'DL',
    code: 'SAFFRON',
    name: 'Saffron City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  { country_code: 'DL', code: 'SILPH', name: 'Silph Co.', type: 'facility', attributes: {} },
  {
    country_code: 'DL',
    code: 'CINNABAR',
    name: 'Cinnabar Island',
    type: 'city',
    attributes: { type: 'gym' },
  },
  {
    country_code: 'DL',
    code: 'PKMN_MANSION',
    name: 'Pokemon Mansion',
    type: 'facility',
    attributes: {},
  },
  { country_code: 'DL', code: 'BLUE', name: 'Trainer Blue', type: 'individual', attributes: {} },

  { country_code: 'TO', code: 'TO', name: 'TO', type: 'country', attributes: {} },
  {
    country_code: 'TO',
    code: 'NEWBARK',
    name: 'New Bark Town',
    type: 'village',
    attributes: {},
  },
  {
    country_code: 'TO',
    code: 'CHERRYGROVE',
    name: 'Cherrygrove City',
    type: 'city',
    attributes: {},
  },
  {
    country_code: 'TO',
    code: 'VIOLET',
    name: 'Violet City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  {
    country_code: 'TO',
    code: 'SPROUT_TOWER',
    name: 'Sprout Tower',
    type: 'facility',
    attributes: {},
  },
  {
    country_code: 'TO',
    code: 'AZALEA',
    name: 'Azalea Town',
    type: 'village',
    attributes: { type: 'gym' },
  },
  {
    country_code: 'TO',
    code: 'SLOWPOKE_WELL',
    name: 'Slowpoke Well',
    type: 'facility',
    attributes: {},
  },
  {
    country_code: 'TO',
    code: 'GOLDENROD',
    name: 'Goldenrod City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  {
    country_code: 'TO',
    code: 'ECRUTEAK',
    name: 'Ecruteak City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  {
    country_code: 'TO',
    code: 'BELL_TOWER',
    name: 'Bell Tower',
    type: 'facility',
    attributes: {},
  },
  {
    country_code: 'TO',
    code: 'BURNED_TOWER',
    name: 'Burned Tower',
    type: 'facility',
    attributes: {},
  },
  {
    country_code: 'TO',
    code: 'OLIVINE',
    name: 'Olivine City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  {
    country_code: 'TO',
    code: 'OLIVINE_LIGHTHOUSE',
    name: 'Olivine Lighthouse',
    type: 'facility',
    attributes: {},
  },
  { country_code: 'TO', code: 'CIANWOOD', name: 'Cianwood City', type: 'city', attributes: {} },
  {
    country_code: 'TO',
    code: 'MAHOGANY',
    name: 'Mahogany Town',
    type: 'village',
    attributes: {},
  },
  {
    country_code: 'TO',
    code: 'BLACKTHORN',
    name: 'Blackthorn City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  {
    country_code: 'TO',
    code: 'DRAGONS_DEN',
    name: "Dragon's Den",
    type: 'facility',
    attributes: {},
  },
];

export const ENTITY_RELATIONS = [
  { parent: 'redblue', child: 'DL', hierarchy: 'redblue' },
  { parent: 'DL', child: 'PALLET', hierarchy: 'redblue' },
  { parent: 'PALLET', child: 'BLUE', hierarchy: 'redblue' },
  { parent: 'DL', child: 'VIRIDIAN', hierarchy: 'redblue' },
  { parent: 'DL', child: 'PEWTER', hierarchy: 'redblue' },
  { parent: 'DL', child: 'CERULEAN', hierarchy: 'redblue' },
  { parent: 'DL', child: 'VERMILLION', hierarchy: 'redblue' },
  { parent: 'DL', child: 'LAVENDER', hierarchy: 'redblue' },
  { parent: 'DL', child: 'CELADON', hierarchy: 'redblue' },
  { parent: 'DL', child: 'FUCHSIA', hierarchy: 'redblue' },
  { parent: 'DL', child: 'CINNABAR', hierarchy: 'redblue' },
  { parent: 'CERULEAN', child: 'CERULEAN_CAVE', hierarchy: 'redblue' },
  { parent: 'LAVENDER', child: 'PKMN_TOWER', hierarchy: 'redblue' },
  { parent: 'CELADON', child: 'CELADON_GAME', hierarchy: 'redblue' },
  { parent: 'FUCHSIA', child: 'SAFARI', hierarchy: 'redblue' },
  { parent: 'DL', child: 'SAFFRON', hierarchy: 'redblue' },
  { parent: 'SAFFRON', child: 'SILPH', hierarchy: 'redblue' },
  { parent: 'CINNABAR', child: 'PKMN_MANSION', hierarchy: 'redblue' },

  { parent: 'goldsilver', child: 'DL', hierarchy: 'goldsilver' },
  { parent: 'goldsilver', child: 'TO', hierarchy: 'goldsilver' },
  { parent: 'DL', child: 'PALLET', hierarchy: 'goldsilver' },
  { parent: 'DL', child: 'VIRIDIAN', hierarchy: 'goldsilver' },
  { parent: 'DL', child: 'PEWTER', hierarchy: 'goldsilver' },
  { parent: 'DL', child: 'CERULEAN', hierarchy: 'goldsilver' },
  { parent: 'DL', child: 'VERMILLION', hierarchy: 'goldsilver' },
  { parent: 'DL', child: 'LAVENDER', hierarchy: 'goldsilver' },
  { parent: 'DL', child: 'CELADON', hierarchy: 'goldsilver' },
  { parent: 'DL', child: 'FUCHSIA', hierarchy: 'goldsilver' },
  { parent: 'DL', child: 'SAFFRON', hierarchy: 'goldsilver' },
  { parent: 'DL', child: 'SILPH', hierarchy: 'goldsilver' },
  { parent: 'TO', child: 'NEWBARK', hierarchy: 'goldsilver' },
  { parent: 'TO', child: 'CHERRYGROVE', hierarchy: 'goldsilver' },
  { parent: 'TO', child: 'VIOLET', hierarchy: 'goldsilver' },
  { parent: 'TO', child: 'AZALEA', hierarchy: 'goldsilver' },
  { parent: 'TO', child: 'GOLDENROD', hierarchy: 'goldsilver' },
  { parent: 'TO', child: 'ECRUTEAK', hierarchy: 'goldsilver' },
  { parent: 'TO', child: 'OLIVINE', hierarchy: 'goldsilver' },
  { parent: 'TO', child: 'CIANWOOD', hierarchy: 'goldsilver' },
  { parent: 'TO', child: 'MAHOGANY', hierarchy: 'goldsilver' },
  { parent: 'TO', child: 'BLACKTHORN', hierarchy: 'goldsilver' },
  { parent: 'VIRIDIAN', child: 'BLUE', hierarchy: 'goldsilver' },
  { parent: 'CERULEAN', child: 'CERULEAN_CAVE', hierarchy: 'goldsilver' },
  { parent: 'LAVENDER', child: 'LAVENDER_RADIO_TOWER', hierarchy: 'goldsilver' },
  { parent: 'CELADON', child: 'CELADON_GAME', hierarchy: 'goldsilver' },
  { parent: 'VIOLET', child: 'SPROUT_TOWER', hierarchy: 'goldsilver' },
  { parent: 'AZALEA', child: 'SLOWPOKE_WELL', hierarchy: 'goldsilver' },
  { parent: 'ECRUTEAK', child: 'BELL_TOWER', hierarchy: 'goldsilver' },
  { parent: 'ECRUTEAK', child: 'BURNED_TOWER', hierarchy: 'goldsilver' },
  { parent: 'OLIVINE', child: 'OLIVINE_LIGHTHOUSE', hierarchy: 'goldsilver' },
  { parent: 'BLACKTHORN', child: 'DRAGONS_DEN', hierarchy: 'goldsilver' },
];
