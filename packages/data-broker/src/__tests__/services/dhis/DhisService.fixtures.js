/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const SERVER_NAME = 'test server name';

const createDataSource = fields => ({ service_type: 'dhis', config: {}, ...fields });

export const DATA_SOURCES = {
  POP01: createDataSource({ code: 'POP01', dataElementCode: 'POP01' }),
  POP02: createDataSource({ code: 'POP02', dataElementCode: 'POP02' }),
  DIF01: createDataSource({
    code: 'DIF01',
    dataElementCode: 'DIF01_DHIS',
  }),
};

export const DATA_GROUPS = {
  POP01_GROUP: createDataSource({
    code: 'POP01', // intentionally the same as `POP01` data element, as their type should differentiate them
  }),
  DIFF_GROUP: createDataSource({
    code: 'DIFF_GROUP',
  }),
};

const DL_FACILITY_A = {
  code: 'DL_FACILITY_A',
  name: 'DL FACILITY A',
  type: 'facility',
  metadata: {},
  isTrackedEntity: () => false,
};

export const ENTITIES = {
  DL_FACILITY_A,
  DL_HOUSEHOLD_1: {
    code: 'DL_HOUSEHOLD_1',
    name: 'DL HOUSEHOLD 1',
    type: 'household',
    metadata: {
      dhis: { isDataRegional: false, trackedEntityId: 'tracked_entity_id_dl_household_1' },
    },
    isTrackedEntity: () => true,
    getParent: async () => DL_FACILITY_A,
  },
  DL_HOUSEHOLD_2: {
    code: 'DL_HOUSEHOLD_2',
    name: 'DL HOUSEHOLD 2',
    type: 'household',
    metadata: {
      dhis: { isDataRegional: false, trackedEntityId: 'tracked_entity_id_dl_household_2' },
    },
    isTrackedEntity: () => true,
    getParent: async () => DL_FACILITY_A,
  },
};

export const ENTITY_HIERARCHIES = {
  explore: {
    name: 'explore',
    id: '1234',
  },
};

export const DATA_VALUES = {
  POP01: { code: 'POP01', value: '1' },
  POP02: { code: 'POP02', value: '2' },
  DIF01: { code: 'DIF01', value: '3' },
};

export const DHIS_RESPONSE_DATA_ELEMENTS = {
  POP01: { code: 'POP01', uid: 'id000POP01', name: 'Population 1' },
  POP02: { code: 'POP02', uid: 'id000POP02', name: 'Population 2' },
  DIF01_DHIS: { code: 'DIF01_DHIS', uid: 'id000DIF01_DHIS', name: 'Different 1' },
};

export const DATA_ELEMENTS_BY_GROUP = {
  POP01: [DATA_SOURCES.POP01, DATA_SOURCES.POP02],
  DIFF_GROUP: [DATA_SOURCES.POP01, DATA_SOURCES.DIF01],
};

export const DHIS_REFERENCE = 'XXXYYY';

const EVENT_ANALYTICS_SAME_DHIS_ELEMENT_CODES = {
  headers: [
    { name: 'oucode', column: 'Organisation unit code', valueType: 'TEXT' },
    { name: 'POP01', column: 'Population 1', valueType: 'NUMBER' },
    { name: 'BCD2', column: 'Population 2', valueType: 'TEXT' },
  ],
  metaData: {
    items: {
      ou: { name: 'Organisation unit' },
      POP01: { name: 'Population 1' },
      POP02: { name: 'Population 2' },
    },
    dimensions: {
      ou: ['tonga_dhisId'],
      POP01: [],
      POP02: [],
    },
  },
  width: 3,
  height: 1,
  rows: [['TO_Nukuhc', '10.0', '15.0']],
};

const EVENT_ANALYTICS_DIFFERENT_DHIS_ELEMENT_CODES = {
  headers: [
    { name: 'oucode', column: 'Organisation unit code', valueType: 'TEXT' },
    { name: 'DIF01_DHIS', column: 'Different 1', valueType: 'NUMBER' },
  ],
  metaData: {
    items: {
      ou: { name: 'Organisation unit' },
      DIF01_DHIS: { name: 'Different 1' },
    },
    dimensions: {
      ou: ['tonga_dhisId'],
      DIF01_DHIS: [],
    },
  },
  width: 2,
  height: 1,
  rows: [['TO_Nukuhc', '25.0']],
};

export const EVENT_ANALYTICS = {
  sameDhisElementCodes: EVENT_ANALYTICS_SAME_DHIS_ELEMENT_CODES,
  differentDhisElementCodes: EVENT_ANALYTICS_DIFFERENT_DHIS_ELEMENT_CODES,
};
