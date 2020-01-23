/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const SERVER_NAME = 'test server name';

export const BASIC_DATA_SOURCE = {
  type: 'dataElement',
  service_type: 'testServiceType',
  config: {},
};

export const CODE_1 = 'POP01';
export const CODE_2 = 'POP02';
export const DIFFERENT_CODE = 'DIFF_01';

export const DATA_ELEMENT_CODE_TO_ID = {
  [CODE_1]: 'id00001',
  [CODE_2]: 'id00002',
  [DIFFERENT_CODE]: 'id00003',
};

export const DATA_SOURCE_1 = { code: CODE_1, ...BASIC_DATA_SOURCE };
export const DATA_SOURCE_2 = { code: CODE_2, ...BASIC_DATA_SOURCE };
export const UNUSED_DATA_SOURCE = { code: 'UNUSED_01', ...BASIC_DATA_SOURCE };

export const DATA_GROUP_DATA_SOURCE = {
  ...BASIC_DATA_SOURCE,
  type: 'dataGroup',
  code: CODE_1, // intentionally teh same as data source 1, as they should be differentiated by type
};

export const DATA_VALUE_1 = { code: CODE_1, value: 1 };
export const DATA_VALUE_2 = { code: CODE_2, value: 2 };

export const DHIS_REFERENCE = 'XXXYYY';
