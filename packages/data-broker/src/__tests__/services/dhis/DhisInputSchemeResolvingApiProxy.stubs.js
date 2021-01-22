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

const DHIS_ORG_UNIT_MAPPING = [{ code: 'ORG1', dhis_id: 'dhisId_ou1' }];

const createModelsStub = () => ({
  dataSource: {
    find: async filter => DATA_SOURCES.filter(dataSource => filter.code.includes(dataSource.code)),
    findOne: async filter => {
      const results = DATA_SOURCES.filter(dataSource => filter.code.includes(dataSource.code));
      const [first] = results;
      return first;
    },
  },
  dhisOrgUnitMapping: {
    find: async filter =>
      DHIS_ORG_UNIT_MAPPING.filter(mapping => filter.code.includes(mapping.code)),
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
