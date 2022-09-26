/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import type { DhisApi } from '@tupaia/dhis-api';
import { DhisInputSchemeResolvingApiProxy } from '../../../services/dhis/DhisInputSchemeResolvingApiProxy';
import { DataBrokerModelRegistry } from '../../../types';

const DATA_ELEMENTS = [
  { code: 'EL1', config: { dhisId: 'dhisId_el1' } },
  { code: 'EL2', config: { dhisId: 'dhisId_el2' } },
  { code: 'EL3', config: {} },
];

const DATA_GROUPS = [
  { code: 'G1', config: { dhisId: 'dhisId_g1' } },
  { code: 'G2', config: {} },
];

const DATA_SERVICE_ENTITIES = [{ entity_code: 'ORG1', config: { dhis_id: 'dhisId_ou1' } }];

const createModelsStub = () =>
  ({
    dataElement: {
      find: async (dbConditions: { code: string[] }) =>
        DATA_ELEMENTS.filter(dataElement => dbConditions.code.includes(dataElement.code)),
      findOne: async (dbConditions: { code: string[] }) => {
        const results = DATA_ELEMENTS.filter(dataElement =>
          dbConditions.code.includes(dataElement.code),
        );
        const [first] = results;
        return first;
      },
    },
    dataServiceEntity: {
      find: async (dbConditions: { 'config->>dhis_id': string[]; entity_code: string[] }) =>
        dbConditions['config->>dhis_id']
          ? DATA_SERVICE_ENTITIES.filter(mapping =>
              dbConditions['config->>dhis_id'].includes(mapping.config.dhis_id),
            )
          : DATA_SERVICE_ENTITIES.filter(mapping =>
              dbConditions.entity_code.includes(mapping.entity_code),
            ),
    },
    dataGroup: {
      find: async (dbConditions: { code: string[] }) =>
        DATA_GROUPS.filter(dataGroup => dbConditions.code.includes(dataGroup.code)),
      findOne: async (dbConditions: { code: string[] }) => {
        const results = DATA_GROUPS.filter(dataGroup => dbConditions.code.includes(dataGroup.code));
        const [first] = results;
        return first;
      },
    },
  } as DataBrokerModelRegistry);

export const createApiStub = () => {
  return ({
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
  } as unknown) as DhisApi;
};

export const createApiProxyStub = (api: DhisApi) => {
  return new DhisInputSchemeResolvingApiProxy(createModelsStub(), api);
};
