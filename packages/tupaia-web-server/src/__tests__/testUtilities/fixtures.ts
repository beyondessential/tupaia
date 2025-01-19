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
];

export const ENTITY_RELATIONS = [
  { parent: 'redblue', child: 'DL', hierarchy: 'redblue' },
  { parent: 'DL', child: 'CINNABAR', hierarchy: 'redblue' },
];
