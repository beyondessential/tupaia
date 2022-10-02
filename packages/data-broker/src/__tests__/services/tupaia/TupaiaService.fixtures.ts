/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DataElement, DataGroup, ServiceType } from '../../../types';
import { TYPES } from '@tupaia/database';

const dataElement = ({ code, service_type }: { code: string; service_type: ServiceType }) => ({
  code,
  service_type,
  dataElementCode: code,
  config: {},
  permission_groups: ['*'],
  databaseType: TYPES.DATA_ELEMENT,
});

const dataGroup = ({ code, service_type }: { code: string; service_type: ServiceType }) => ({
  code,
  service_type,
  config: {},
  databaseType: TYPES.DATA_GROUP,
});

export const DATA_ELEMENTS: Record<string, DataElement> = {
  POP01: dataElement({ code: 'POP01', service_type: 'tupaia' }),
  POP02: dataElement({ code: 'POP02', service_type: 'tupaia' }),
};

export const DATA_GROUPS: Record<string, DataGroup> = {
  // intentionally sharing a code with the `POP01` data element,
  // since their type should differentiate them
  POP01_GROUP: dataGroup({ code: 'POP01', service_type: 'tupaia' }),
  POP02_GROUP: dataGroup({ code: 'POP02', service_type: 'tupaia' }),
};

export const DATA_ELEMENT_METADATA = {
  POP01: {
    code: 'POP01',
    name: 'Population 1',
  },
  POP02: {
    code: 'POP02',
    name: 'Population 2',
  },
};

export const ANALYTICS = {
  analytics: [
    {
      period: '20200206',
      organisationUnit: 'TO_Nukuhc',
      dataElement: 'POP01',
      value: 1,
    },
    {
      period: '20200206',
      organisationUnit: 'Nukunuku',
      dataElement: 'POP02',
      value: 2,
    },
  ],
  numAggregationsProcessed: 1,
};

export const EVENTS = [
  {
    event: '5d5f04faf013d60c0f6ecde5',
    eventDate: '2020-02-06T10:18:00.000',
    orgUnit: 'TO_Nukuhc',
    orgUnitName: 'Nukunuku',
    dataValues: {
      POP01: 1,
      POP02: 2,
    },
  },
];
