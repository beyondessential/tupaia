/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DhisInputSchemeResolvingApiProxy } from '../../../services/dhis/DhisInputSchemeResolvingApiProxy';

const DATA_SOURCES = [
  { code: 'EL1', type: 'dataElement', config: { dhisId: 'dhisId_el1' } },
  { code: 'EL2', type: 'dataElement', config: { dhisId: 'dhisId_el2' } },
  { code: 'EL3', type: 'dataElement', config: {} },
  { code: 'G1', type: 'dataGroup', config: { dhisId: 'dhisId_g1' } },
  { code: 'G2', type: 'dataGroup', config: {} },
];

const DATA_SERVICE_ENTITIES = [{ entity_code: 'ORG1', config: { dhis_id: 'dhisId_ou1' } }];

const createModelsStub = () => ({
  dataSource: {
    find: async filter => DATA_SOURCES.filter(dataSource => filter.code.includes(dataSource.code)),
    findOne: async filter => {
      const results = DATA_SOURCES.filter(dataSource => filter.code.includes(dataSource.code));
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
