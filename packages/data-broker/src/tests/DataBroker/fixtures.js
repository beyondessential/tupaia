/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const DATA_SOURCE_SPECS = {
  POP01: { code: 'POP01', type: 'dataElement' },
  POP02: { code: 'POP02', type: 'dataElement' },
};
export const DATA_SOURCES = {
  POP01: { ...DATA_SOURCE_SPECS.POP01, service_type: 'testServiceType', config: {} },
  POP02: { ...DATA_SOURCE_SPECS.POP02, service_type: 'testServiceType', config: {} },
};
