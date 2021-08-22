/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const createDataSource = fields => ({ config: {}, ...fields });

export const DATA_SOURCES = {
  POP01: createDataSource({ type: 'dataElement', code: 'POP01' }),
  POP02: createDataSource({ type: 'dataElement', code: 'POP02' }),
  POP01_GROUP: createDataSource({ type: 'dataGroup', code: 'POP01' }), // intentionally the same as `POP01` data element, as their type should differentiate them
  POP02_GROUP: createDataSource({ type: 'dataGroup', code: 'POP02' }),
};

export const DATA_ELEMENTS = {
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
