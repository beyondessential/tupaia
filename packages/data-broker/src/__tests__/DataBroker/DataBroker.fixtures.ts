/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DataSource } from '../../types';
import { ServiceResult } from './DataBroker.stubs';

// Data elements and groups share the same codes on purpose, to assert that
// `DataBroker` can still distinguish them using their type
export const DATA_ELEMENTS: Record<string, DataSource> = {
  TEST_01: { code: 'TEST_01', type: 'dataElement', service_type: 'test', config: {} },
  TEST_02: { code: 'TEST_02', type: 'dataElement', service_type: 'test', config: {} },
  OTHER_01: { code: 'OTHER_01', type: 'dataElement', service_type: 'other', config: {} },
};
export const DATA_GROUPS: Record<string, DataSource> = {
  TEST_01: { code: 'TEST_01', type: 'dataGroup', service_type: 'test', config: {} },
  TEST_02: { code: 'TEST_02', type: 'dataGroup', service_type: 'test', config: {} },
  OTHER_01: { code: 'OTHER_01', type: 'dataGroup', service_type: 'other', config: {} },
};

export const DATA_BY_SERVICE: Record<string, ServiceResult[]> = {
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
