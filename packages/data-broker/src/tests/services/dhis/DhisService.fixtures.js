/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const SERVER_NAME = 'test server name';

const BASIC_DATA_SOURCE = {
  type: 'dataElement',
  service_type: 'testServiceType',
  config: {},
};

export const DATA_ELEMENT_CODE_TO_ID = {
  POP01: 'id000POP01',
  POP02: 'id000POP02',
  DIF01: 'id000DIF01',
};

export const DATA_SOURCES = {
  POP01: { code: 'POP01', ...BASIC_DATA_SOURCE },
  POP02: { code: 'POP02', ...BASIC_DATA_SOURCE },
  UNUSED01: { code: 'UNUSED01', ...BASIC_DATA_SOURCE },
  POP01_GROUP: {
    ...BASIC_DATA_SOURCE,
    type: 'dataGroup',
    code: 'POP01', // intentionally the same as data source 1, as they should be differentiated by type
  },
};

export const DATA_VALUES = {
  POP01: { code: 'POP01', value: 1 },
  POP02: { code: 'POP02', value: 2 },
};

export const DHIS_REFERENCE = 'XXXYYY';
