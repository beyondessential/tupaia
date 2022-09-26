/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DhisEventAnalytics } from '../../../services/dhis/types';
import { DataElement, DataGroup } from '../../../types';

export const SERVER_NAME = 'test server name';

const dataElement = ({
  code,
  dataElementCode,
}: {
  code: string;
  dataElementCode: string;
}): DataElement => ({
  code,
  dataElementCode,
  service_type: 'dhis',
  config: {},
  permission_groups: ['*'],
});

export const DATA_ELEMENTS = {
  POP01: dataElement({ code: 'POP01', dataElementCode: 'POP01' }),
  POP02: dataElement({ code: 'POP02', dataElementCode: 'POP02' }),
  DIF01: dataElement({ code: 'DIF01', dataElementCode: 'DIF01_DHIS' }),
};

export const DATA_GROUPS: Record<string, DataGroup> = {
  // code is intentionally the same as `POP01` data element, as their type should differentiate them
  POP01_GROUP: { service_type: 'dhis', code: 'POP01', config: {} },
  DIFF_GROUP: { service_type: 'dhis', code: 'DIFF_GROUP', config: {} },
};

export const DATA_VALUES = {
  POP01: { code: 'POP01', value: '1', orgUnit: 'TO', period: '20210101' },
  POP02: { code: 'POP02', value: '2', orgUnit: 'TO', period: '20210101' },
  DIF01: { code: 'DIF01', value: '3', orgUnit: 'TO', period: '20210101' },
};

export const DATA_ELEMENT_METADATA = {
  POP01: { code: 'POP01', uid: 'id000POP01', name: 'Population 1' },
  POP02: { code: 'POP02', uid: 'id000POP02', name: 'Population 2' },
  DIF01_DHIS: { code: 'DIF01_DHIS', uid: 'id000DIF01_DHIS', name: 'Different 1' },
};

export const DATA_ELEMENTS_BY_GROUP = {
  POP01: [DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02],
  DIFF_GROUP: [DATA_ELEMENTS.POP01, DATA_ELEMENTS.DIF01],
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
