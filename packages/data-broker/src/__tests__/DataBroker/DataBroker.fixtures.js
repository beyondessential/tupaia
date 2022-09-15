/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';

// Data elements and groups share the same codes on purpose, to assert that
// `DataBroker` can still distinguish them using their type
export const DATA_ELEMENTS = {
  TEST_01: {
    code: 'TEST_01',
    service_type: 'test',
    config: {},
    permission_groups: ['*'],
    databaseType: TYPES.DATA_ELEMENT,
  },
  TEST_02: {
    code: 'TEST_02',
    service_type: 'test',
    config: {},
    permission_groups: ['*'],
    databaseType: TYPES.DATA_ELEMENT,
  },
  OTHER_01: {
    code: 'OTHER_01',
    service_type: 'other',
    config: {},
    permission_groups: ['*'],
    databaseType: TYPES.DATA_ELEMENT,
  },
  MAPPED_01: {
    code: 'MAPPED_01',
    service_type: 'test',
    config: {},
    permission_groups: ['*'],
    databaseType: TYPES.DATA_ELEMENT,
  },
  MAPPED_02: {
    code: 'MAPPED_02',
    service_type: 'test',
    config: {},
    permission_groups: ['*'],
    databaseType: TYPES.DATA_ELEMENT,
  },
};
export const DATA_GROUPS = {
  TEST_01: { code: 'TEST_01', service_type: 'test', config: {}, databaseType: TYPES.DATA_GROUP },
  TEST_02: { code: 'TEST_02', service_type: 'test', config: {}, databaseType: TYPES.DATA_GROUP },
  OTHER_01: { code: 'OTHER_01', service_type: 'other', config: {}, databaseType: TYPES.DATA_GROUP },
};

export const DATA_BY_SERVICE = {
  test: [
    { code: 'TEST_01', type: 'dataElement', name: 'Test element 1', value: 1 },
    { code: 'TEST_01', type: 'dataGroup', name: 'Test group 1', value: 10 },
    { code: 'TEST_02', type: 'dataElement', name: 'Test element 2', value: 2 },
    { code: 'TEST_02', type: 'dataGroup', name: 'Test group 2', value: 20 },
  ],
  other: [
    { code: 'OTHER_01', type: 'dataElement', name: 'Other element 1', value: 3 },
    { code: 'OTHER_01', type: 'dataGroup', name: 'Other group 1', value: 30 },
  ],
};

export const ENTITIES = {
  TO_FACILITY_01: { code: 'TO_FACILITY_01', country_code: 'TO' },
  FJ_FACILITY_01: { code: 'FJ_FACILITY_01', country_code: 'FJ' },
  TO: { code: 'TO', country_code: 'TO', type: 'country' },
  FJ: { code: 'FJ', country_code: 'FJ', type: 'country' },
};

export const DATA_ELEMENT_DATA_SERVICES = [
  {
    data_element_code: 'MAPPED_01',
    country_code: 'FJ',
    service_type: 'other',
    service_config: { cow: 'moo' },
  },
  {
    data_element_code: 'MAPPED_02',
    country_code: 'FJ',
    service_type: 'other',
    service_config: { sheep: 'baaaa' },
  },
];
