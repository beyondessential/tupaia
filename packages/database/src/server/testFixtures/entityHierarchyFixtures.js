import { ensure } from '@tupaia/tsutils';

const getHierarchyWithFields = (hierarchyCode, fields) => {
  const hierarchy = ensure(ENTITIES.find(e => e.code === hierarchyCode && e.type === 'project'));

  return Object.fromEntries(fields.map(field => [field, hierarchy[field]]));
};

const getHierarchiesWithFields = (hierarchyCodes, fields) => {
  const allCodes = new Set(ENTITIES.map(e => e.code));

  return hierarchyCodes
    .filter(hierarchyCode => allCodes.has(hierarchyCode))
    .map(hierarchyCode => getHierarchyWithFields(hierarchyCode, fields));
};

const getEntityWithFields = (entityCode, fields) => {
  const entity = ensure(ENTITIES.find(e => e.code === entityCode));

  return Object.fromEntries(fields.map(field => [field, entity[field]]));
};

const getEntitiesWithFields = (entityCodes, fields) => {
  const allCodes = new Set(ENTITIES.map(e => e.code));

  return entityCodes
    .filter(entityCode => allCodes.has(entityCode))
    .map(entityCode => getEntityWithFields(entityCode, fields));
};

const PROJECTS = [
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

const COUNTRIES = ['KANTO', 'JOHTO'];

const ENTITIES = [
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
  { country_code: 'KANTO', code: 'KANTO', name: 'Kanto', type: 'country', attributes: {} },
  { country_code: 'KANTO', code: 'PALLET', name: 'Pallet Town', type: 'village', attributes: {} },
  {
    country_code: 'KANTO',
    code: 'VIRIDIAN',
    name: 'Viridian City',
    type: 'city',
    attributes: {
      type: 'gym',
      gym: {
        type: 'fire',
      },
    },
  },
  {
    country_code: 'KANTO',
    code: 'PEWTER',
    name: 'Pewter City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  {
    country_code: 'KANTO',
    code: 'CERULEAN',
    name: 'Cerulean City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  {
    country_code: 'KANTO',
    code: 'CERULEAN_CAVE',
    name: 'Cerulean Cave',
    type: 'facility',
    attributes: {},
  },
  {
    country_code: 'KANTO',
    code: 'VERMILLION',
    name: 'Vermillion City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  { country_code: 'KANTO', code: 'LAVENDER', name: 'Lavender Town', type: 'city', attributes: {} },
  {
    country_code: 'KANTO',
    code: 'PKMN_TOWER',
    name: 'Pokemon Tower',
    type: 'facility',
    attributes: {},
  },
  {
    country_code: 'KANTO',
    code: 'LAVENDER_RADIO_TOWER',
    name: 'Lavender Radio Tower',
    type: 'facility',
    attributes: {},
  },
  {
    country_code: 'KANTO',
    code: 'CELADON',
    name: 'Celadon City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  {
    country_code: 'KANTO',
    code: 'CELADON_GAME',
    name: 'Celadon Game Corner',
    type: 'facility',
    attributes: {},
  },
  {
    country_code: 'KANTO',
    code: 'FUCHSIA',
    name: 'Fuchsia City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  { country_code: 'KANTO', code: 'SAFARI', name: 'Safari Zone', type: 'facility', attributes: {} },
  {
    country_code: 'KANTO',
    code: 'SAFFRON',
    name: 'Saffron City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  { country_code: 'KANTO', code: 'SILPH', name: 'Silph Co.', type: 'facility', attributes: {} },
  {
    country_code: 'KANTO',
    code: 'CINNABAR',
    name: 'Cinnabar Island',
    type: 'city',
    attributes: { type: 'gym' },
  },
  {
    country_code: 'KANTO',
    code: 'PKMN_MANSION',
    name: 'Pokemon Mansion',
    type: 'facility',
    attributes: {},
  },
  { country_code: 'KANTO', code: 'BLUE', name: 'Trainer Blue', type: 'individual', attributes: {} },

  { country_code: 'JOHTO', code: 'JOHTO', name: 'Johto', type: 'country', attributes: {} },
  {
    country_code: 'JOHTO',
    code: 'NEWBARK',
    name: 'New Bark Town',
    type: 'village',
    attributes: {},
  },
  {
    country_code: 'JOHTO',
    code: 'CHERRYGROVE',
    name: 'Cherrygrove City',
    type: 'city',
    attributes: {},
  },
  {
    country_code: 'JOHTO',
    code: 'VIOLET',
    name: 'Violet City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  {
    country_code: 'JOHTO',
    code: 'SPROUT_TOWER',
    name: 'Sprout Tower',
    type: 'facility',
    attributes: {},
  },
  {
    country_code: 'JOHTO',
    code: 'AZALEA',
    name: 'Azalea Town',
    type: 'village',
    attributes: { type: 'gym' },
  },
  {
    country_code: 'JOHTO',
    code: 'SLOWPOKE_WELL',
    name: 'Slowpoke Well',
    type: 'facility',
    attributes: {},
  },
  {
    country_code: 'JOHTO',
    code: 'GOLDENROD',
    name: 'Goldenrod City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  {
    country_code: 'JOHTO',
    code: 'ECRUTEAK',
    name: 'Ecruteak City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  {
    country_code: 'JOHTO',
    code: 'BELL_TOWER',
    name: 'Bell Tower',
    type: 'facility',
    attributes: {},
  },
  {
    country_code: 'JOHTO',
    code: 'BURNED_TOWER',
    name: 'Burned Tower',
    type: 'facility',
    attributes: {},
  },
  {
    country_code: 'JOHTO',
    code: 'OLIVINE',
    name: 'Olivine City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  {
    country_code: 'JOHTO',
    code: 'OLIVINE_LIGHTHOUSE',
    name: 'Olivine Lighthouse',
    type: 'facility',
    attributes: {},
  },
  { country_code: 'JOHTO', code: 'CIANWOOD', name: 'Cianwood City', type: 'city', attributes: {} },
  {
    country_code: 'JOHTO',
    code: 'MAHOGANY',
    name: 'Mahogany Town',
    type: 'village',
    attributes: {},
  },
  {
    country_code: 'JOHTO',
    code: 'BLACKTHORN',
    name: 'Blackthorn City',
    type: 'city',
    attributes: { type: 'gym' },
  },
  {
    country_code: 'JOHTO',
    code: 'DRAGONS_DEN',
    name: "Dragon's Den",
    type: 'facility',
    attributes: {},
  },
];

const ENTITY_RELATIONS = [
  { parent: 'redblue', child: 'KANTO', hierarchy: 'redblue' },
  { parent: 'KANTO', child: 'PALLET', hierarchy: 'redblue' },
  { parent: 'PALLET', child: 'BLUE', hierarchy: 'redblue' },
  { parent: 'KANTO', child: 'VIRIDIAN', hierarchy: 'redblue' },
  { parent: 'KANTO', child: 'PEWTER', hierarchy: 'redblue' },
  { parent: 'KANTO', child: 'CERULEAN', hierarchy: 'redblue' },
  { parent: 'KANTO', child: 'VERMILLION', hierarchy: 'redblue' },
  { parent: 'KANTO', child: 'LAVENDER', hierarchy: 'redblue' },
  { parent: 'KANTO', child: 'CELADON', hierarchy: 'redblue' },
  { parent: 'KANTO', child: 'FUCHSIA', hierarchy: 'redblue' },
  { parent: 'KANTO', child: 'CINNABAR', hierarchy: 'redblue' },
  { parent: 'CERULEAN', child: 'CERULEAN_CAVE', hierarchy: 'redblue' },
  { parent: 'LAVENDER', child: 'PKMN_TOWER', hierarchy: 'redblue' },
  { parent: 'CELADON', child: 'CELADON_GAME', hierarchy: 'redblue' },
  { parent: 'FUCHSIA', child: 'SAFARI', hierarchy: 'redblue' },
  { parent: 'KANTO', child: 'SAFFRON', hierarchy: 'redblue' },
  { parent: 'SAFFRON', child: 'SILPH', hierarchy: 'redblue' },
  { parent: 'CINNABAR', child: 'PKMN_MANSION', hierarchy: 'redblue' },

  { parent: 'goldsilver', child: 'KANTO', hierarchy: 'goldsilver' },
  { parent: 'goldsilver', child: 'JOHTO', hierarchy: 'goldsilver' },
  { parent: 'KANTO', child: 'PALLET', hierarchy: 'goldsilver' },
  { parent: 'KANTO', child: 'VIRIDIAN', hierarchy: 'goldsilver' },
  { parent: 'KANTO', child: 'PEWTER', hierarchy: 'goldsilver' },
  { parent: 'KANTO', child: 'CERULEAN', hierarchy: 'goldsilver' },
  { parent: 'KANTO', child: 'VERMILLION', hierarchy: 'goldsilver' },
  { parent: 'KANTO', child: 'LAVENDER', hierarchy: 'goldsilver' },
  { parent: 'KANTO', child: 'CELADON', hierarchy: 'goldsilver' },
  { parent: 'KANTO', child: 'FUCHSIA', hierarchy: 'goldsilver' },
  { parent: 'KANTO', child: 'SAFFRON', hierarchy: 'goldsilver' },
  { parent: 'KANTO', child: 'SILPH', hierarchy: 'goldsilver' },
  { parent: 'JOHTO', child: 'NEWBARK', hierarchy: 'goldsilver' },
  { parent: 'JOHTO', child: 'CHERRYGROVE', hierarchy: 'goldsilver' },
  { parent: 'JOHTO', child: 'VIOLET', hierarchy: 'goldsilver' },
  { parent: 'JOHTO', child: 'AZALEA', hierarchy: 'goldsilver' },
  { parent: 'JOHTO', child: 'GOLDENROD', hierarchy: 'goldsilver' },
  { parent: 'JOHTO', child: 'ECRUTEAK', hierarchy: 'goldsilver' },
  { parent: 'JOHTO', child: 'OLIVINE', hierarchy: 'goldsilver' },
  { parent: 'JOHTO', child: 'CIANWOOD', hierarchy: 'goldsilver' },
  { parent: 'JOHTO', child: 'MAHOGANY', hierarchy: 'goldsilver' },
  { parent: 'JOHTO', child: 'BLACKTHORN', hierarchy: 'goldsilver' },
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

export const entityHierarchyFixtures = {
  PROJECTS,
  COUNTRIES,
  ENTITIES,
  ENTITY_RELATIONS,
  getHierarchyWithFields,
  getHierarchiesWithFields,
  getEntityWithFields,
  getEntitiesWithFields,
};
