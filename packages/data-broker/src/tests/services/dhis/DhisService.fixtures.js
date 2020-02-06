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
  DIF01_DHIS: 'id000DIF01_DHIS',
};

export const DATA_SOURCES = {
  POP01: { code: 'POP01', ...BASIC_DATA_SOURCE },
  POP02: { code: 'POP02', ...BASIC_DATA_SOURCE },
  DIF01: { code: 'DIF01', ...BASIC_DATA_SOURCE, config: { dataElementCode: 'DIF01_DHIS' } },
  POP01_GROUP: {
    ...BASIC_DATA_SOURCE,
    type: 'dataGroup',
    code: 'POP01', // intentionally the same as data source 1, as they should be differentiated by type
  },
  DIFF_GROUP: {
    ...BASIC_DATA_SOURCE,
    type: 'dataGroup',
    code: 'DIFF_GROUP',
  },
};

export const DATA_VALUES = {
  POP01: { code: 'POP01', value: 1 },
  POP02: { code: 'POP02', value: 2 },
  DIF01: { code: 'DIF01', value: 3 },
};

export const DATA_ELEMENTS_BY_GROUP = {
  POP01: [DATA_SOURCES.POP01, DATA_SOURCES.POP02],
  DIFF_GROUP: [DATA_SOURCES.POP01, DATA_SOURCES.DIF01],
};

export const DHIS_REFERENCE = 'XXXYYY';
