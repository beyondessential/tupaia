import type { DhisApi } from '@tupaia/dhis-api';
import { createModelsStub as baseCreateModelsStub } from '@tupaia/database';
import { DhisCodeToIdTranslator } from '../../../../services/dhis/translators/DhisCodeToIdTranslator';
import { DataBrokerModelRegistry } from '../../../../types';

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

const createModelsStub = () => {
  return baseCreateModelsStub({
    dataElement: {
      records: DATA_ELEMENTS,
    },
    dataServiceEntity: {
      records: DATA_SERVICE_ENTITIES,
    },
    dataGroup: {
      records: DATA_GROUPS,
    },
  }) as DataBrokerModelRegistry;
};

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
  return new DhisCodeToIdTranslator(createModelsStub(), api);
};
