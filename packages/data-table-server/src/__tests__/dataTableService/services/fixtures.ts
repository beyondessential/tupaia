/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export const ENTITIES = [
  { code: 'AU', name: 'Australia', type: 'country' },
  { code: 'FJ', name: 'Fiji', type: 'country' },
  { code: 'PG', name: 'PNG', type: 'country' },
  {
    code: 'AU_Facility1',
    name: 'Australian Facility 1',
    type: 'facility',
  },
  {
    code: 'AU_Facility2',
    name: 'Australian Facility 2',
    type: 'facility',
  },
  {
    code: 'PG_Facility',
    name: 'PNG Facility',
    type: 'facility',
  },
  { code: 'FJ_Facility', name: 'Fiji Facility', type: 'facility' },
];

export const ENTITY_RELATIONS = {
  explore: [
    { parent: 'AU', child: 'AU_Facility1' },
    { parent: 'AU', child: 'AU_Facility2' },
    { parent: 'FJ', child: 'FJ_Facility' },
  ],
  test: [
    { parent: 'PG', child: 'PG_Facility' },
    { parent: 'FJ', child: 'FJ_Facility' },
  ],
};
