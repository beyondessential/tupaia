/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { createModelsStub as baseCreateModelsStub } from '@tupaia/database';
import { createJestMockInstance } from '@tupaia/utils';

export const DATA_ELEMENTS = {
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
};

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
    chartData: () => SUPERSET_API_RESPONSE,
  });
};
