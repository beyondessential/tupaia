import { createModelsStub as baseCreateModelsStub } from '@tupaia/database';
import { SupersetApi } from '@tupaia/superset-api';
import { createJestMockInstance } from '@tupaia/utils';
import { DataServiceMapping } from '../../../services/DataServiceMapping';
import * as GetSupersetApi from '../../../services/superset/getSupersetApi';
import { dataElements } from '../../testUtils';

export const DATA_ELEMENTS = dataElements({
  ITEM_1: {
    code: 'ITEM_1',
    service_type: 'superset',
    config: {
      supersetInstanceCode: 'SUPERSET_INSTANCE_A',
      supersetChartId: 123,
    },
  },
  ITEM_2_CUSTOM_CODE: {
    code: 'ITEM_2_CUSTOM_CODE',
    service_type: 'superset',
    config: {
      supersetInstanceCode: 'SUPERSET_INSTANCE_A',
      supersetChartId: 123,
      supersetItemCode: 'ITEM_2',
    },
  },
  DE_NO_CHART_ID: {
    code: 'DE_NO_CHART_ID',
    service_type: 'superset',
    config: {
      supersetInstanceCode: 'SUPERSET_INSTANCE_A',
    },
  },
  DE_NOT_SUPERSET: {
    code: 'DE_NOT_SUPERSET',
    service_type: 'dhis',
    config: {},
  },
});

const SUPERSET_INSTANCES = [
  {
    code: 'SUPERSET_INSTANCE_A',
    config: { baseUrl: 'http://localhost/' },
  },
  {
    code: 'SUPERSET_INSTANCE_B',
    config: { baseUrl: 'http://localhost/' },
  },
];

export const SUPERSET_CHART_DATA_RESPONSE = {
  result: [
    {
      data: [
        {
          item_code: 'ITEM_1',
          store_code: 'STORE_1',
          value: 1,
          date: '2020-01-01',
        },
        {
          item_code: 'ITEM_1',
          store_code: 'STORE_2',
          value: 2,
          date: '2020-01-01',
        },
        {
          item_code: 'ITEM_2',
          store_code: 'STORE_1',
          value: 3,
          date: '2020-01-01',
        },
        {
          item_code: 'ITEM_2',
          store_code: 'STORE_2',
          value: 4,
          date: '2020-01-01',
        },
      ],
    },
  ],
};

// A simple mapping with no country-specific overrides
export const DEFAULT_DATA_SERVICE_MAPPING = new DataServiceMapping(
  Object.values(DATA_ELEMENTS).map(de => ({
    dataSource: de,
    service_type: de.service_type,
    config: de.config,
  })),
  [],
);

export const DEFAULT_ORG_UNIT_CODES = ['STORE_1', 'STORE_2'];

export const DEFAULT_PULL_OPTIONS = {
  dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
  organisationUnitCodes: DEFAULT_ORG_UNIT_CODES,
};

export const createModelsStub = () => {
  return baseCreateModelsStub({
    dataElement: {
      records: Object.values(DATA_ELEMENTS),
    },
    supersetInstance: {
      records: SUPERSET_INSTANCES,
    },
  });
};

export const createApiStub = () => {
  return createJestMockInstance('@tupaia/superset-api', 'SupersetApi', {
    chartData: () => SUPERSET_CHART_DATA_RESPONSE,
  });
};

export const stubGetSupersetApi = (mockSupersetApi: SupersetApi) => {
  jest.spyOn(GetSupersetApi, 'getSupersetApiInstance').mockResolvedValue(mockSupersetApi);
};
