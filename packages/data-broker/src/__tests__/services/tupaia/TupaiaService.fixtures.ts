import { dataElements, dataGroups } from '../../testUtils';

export const DATA_ELEMENTS = dataElements({
  POP01: { code: 'POP01', service_type: 'tupaia' },
  POP02: { code: 'POP02', service_type: 'tupaia' },
});

export const DATA_GROUPS = dataGroups({
  // intentionally sharing a code with the `POP01` data element,
  // since their type should differentiate them
  POP01_GROUP: { code: 'POP01', service_type: 'tupaia' },
  POP02_GROUP: { code: 'POP02', service_type: 'tupaia' },
});

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
