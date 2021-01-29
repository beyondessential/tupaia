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
      DATA_SERVICE_ENTITIES.filter(mapping => filter.entity_code.includes(mapping.entity_code)),
  },
});

export const createApiStub = () => {
  return {
    getAnalytics: jest.fn().mockReturnValue({ SOME_ANALYTICS_RESPONSE: 1 }),
    getEventAnalytics: jest.fn().mockReturnValue({ SOME_EVENT_ANALYTICS_RESPONSE: 1 }),
  };
};

export const createApiProxyStub = api => {
  return new DhisInputSchemeResolvingApiProxy(createModelsStub(), api);
};
