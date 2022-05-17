/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DhisEventAnalytics } from '../../../services/dhis/types';
import { DataSource } from '../../../types';

export const SERVER_NAME = 'test server name';

const createDataSource = (fields: Partial<DataSource>) =>
  ({ service_type: 'dhis', config: {}, ...fields } as DataSource);

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
    code: 'POP01', // intentionally the same as `POP01` data element, as their type should differentiate them
  }),
  DIFF_GROUP: createDataSource({
    type: 'dataGroup',
    code: 'DIFF_GROUP',
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

const EVENT_ANALYTICS_SAME_DHIS_ELEMENT_CODES: DhisEventAnalytics = {
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

const EVENT_ANALYTICS_DIFFERENT_DHIS_ELEMENT_CODES: DhisEventAnalytics = {
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
