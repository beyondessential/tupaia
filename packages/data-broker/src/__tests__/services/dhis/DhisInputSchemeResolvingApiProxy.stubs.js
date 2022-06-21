/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DhisInputSchemeResolvingApiProxy } from '../../../services/dhis/DhisInputSchemeResolvingApiProxy';

const DATA_SOURCES = [
  { code: 'EL1', config: { dhisId: 'dhisId_el1' } },
  { code: 'EL2', config: { dhisId: 'dhisId_el2' } },
  { code: 'EL3', config: {} },
];

const DATA_GROUPS = [
  { code: 'G1', config: { dhisId: 'dhisId_g1' } },
  { code: 'G2', config: {} },
];

const DATA_SERVICE_ENTITIES = [{ entity_code: 'ORG1', config: { dhis_id: 'dhisId_ou1' } }];

const createModelsStub = () => ({
  dataElement: {
    find: async filter =>
      DATA_SOURCES.filter(dataElement => filter.code.includes(dataElement.code)),
    findOne: async filter => {
      const results = DATA_SOURCES.filter(dataElement => filter.code.includes(dataElement.code));
      const [first] = results;
      return first;
    },
  },
  dataServiceEntity: {
    find: async filter =>
      filter['config->>dhis_id']
        ? DATA_SERVICE_ENTITIES.filter(mapping =>
            filter['config->>dhis_id'].includes(mapping.config.dhis_id),
          )
        : DATA_SERVICE_ENTITIES.filter(mapping => filter.entity_code.includes(mapping.entity_code)),
  },
  dataGroup: {
    find: async filter => DATA_GROUPS.filter(dataGroup => filter.code.includes(dataGroup.code)),
    findOne: async filter => {
      const results = DATA_GROUPS.filter(dataGroup => filter.code.includes(dataGroup.code));
      const [first] = results;
      return first;
    },
  },
});

export const createApiStub = () => {
  return {
    getAnalytics: jest.fn().mockReturnValue({ SOME_ANALYTICS_RESPONSE: 1 }),
    getEventAnalytics: jest.fn().mockImplementation(() => ({
      headers: [
        {
          name: 'oucode',
          column: 'Organisation unit code',
          valueType: 'TEXT',
          type: 'java.lang.String',
          hidden: false,
          meta: true,
        },
        {
          name: 'ou',
          column: 'Organisation unit',
          valueType: 'TEXT',
          type: 'java.lang.String',
          hidden: false,
          meta: true,
        },
        {
          name: 'Dyq13cMGMzT',
          column: 'NCLE: Disease name',
          valueType: 'TEXT',
          type: 'java.lang.String',
          hidden: false,
          meta: true,
          optionSet: 'kMe7B54S9VH',
        },
      ],
      rows: [['dhisCode_ou1-Not-Mapped', 'dhisId_ou1', '7.1']],
      metadata: {},
      width: 3,
      height: 1,
      headerWidth: 3,
    })),
  };
};

export const createApiProxyStub = api => {
  return new DhisInputSchemeResolvingApiProxy(createModelsStub(), api);
};
