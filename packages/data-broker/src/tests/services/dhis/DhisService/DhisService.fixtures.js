/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const SERVER_NAME = 'test server name';

const BASIC_DATA_SOURCE = {
  service_type: 'testServiceType',
  config: {},
};

const createDataSource = fields => ({ ...BASIC_DATA_SOURCE, ...fields });

export const DATA_SOURCES = {
  POP01: createDataSource({ type: 'dataElement', code: 'POP01', dataElementCode: 'POP01' }),
  POP02: createDataSource({ type: 'dataElement', code: 'POP02', dataElementCode: 'POP02' }),
  DIF01: createDataSource({
    type: 'dataElement',
    code: 'DIF01',
    dataElementCode: 'DIF01_DHIS',
  }),
  POP01_GROUP: createDataSource({
    type: 'dataGroup',
    code: 'POP01', // intentionally the same as data source 1, as they should be differentiated by type
    dataElementCode: 'POP01_GROUP',
  }),
  DIFF_GROUP: createDataSource({
    type: 'dataGroup',
    code: 'DIFF_GROUP',
    dataElementCode: 'DIFF_GROUP',
  }),
};

export const DATA_VALUES = {
  POP01: { code: 'POP01', value: '1' },
  POP02: { code: 'POP02', value: '2' },
  DIF01: { code: 'DIF01', value: '3' },
};

export const DATA_ELEMENTS = {
  POP01: { code: 'POP01', uid: 'id000POP01', name: 'Population 1' },
  POP02: { code: 'POP02', uid: 'id000POP02', name: 'Population 2' },
  DIF01_DHIS: { code: 'DIF01_DHIS', uid: 'id000DIF01_DHIS', name: 'Different 1' },
};

export const DATA_ELEMENTS_BY_GROUP = {
  POP01: [DATA_SOURCES.POP01, DATA_SOURCES.POP02],
  DIFF_GROUP: [DATA_SOURCES.POP01, DATA_SOURCES.DIF01],
};

export const DHIS_REFERENCE = 'XXXYYY';
