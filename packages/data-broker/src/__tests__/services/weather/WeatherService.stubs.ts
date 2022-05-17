import { EntityModel } from '@tupaia/database';
import { createJestMockInstance } from '@tupaia/utils';
import { WeatherResult } from '../../../services/weather/types';
import { PullOptions } from '../../../services/weather/WeatherService';
import { DataBrokerModelRegistry, DataSource, DataSourceType, Entity } from '../../../types';

interface MockModelResponseMap {
  entity: {
    find?: Entity[];
  };
  dataSource: {
    find?: DataSource[];
    getDataElementsInGroup?: DataSource[];
  };
}

type DataSourceInstance = DataSource & {
  model: Record<string, unknown>;
  id: string;
};

export const createWeatherApiStub = (
  historicDailyResponse: WeatherResult,
  forecastDailyResponse?: WeatherResult,
) =>
  createJestMockInstance('@tupaia/weather-api', 'WeatherApi', {
    historicDaily: async () => historicDailyResponse,
    forecastDaily: async () => forecastDailyResponse,
  });

export const createWeatherApiStubWithMockResponse = () => {
  return createWeatherApiStub(
    {
      data: [
        {
          precip: 23.6,
          max_temp: 29.8,
          min_temp: 24,
          datetime: '2020-08-20',
        },
        {
          precip: 5,
          max_temp: 6,
          min_temp: 7,
          datetime: '2020-08-21',
        },
      ],
      sources: [],
    },
    {
      data: [
        {
          precip: 100,
          max_temp: 112,
          min_temp: 111,
          datetime: '2020-08-22',
        },
      ],
    },
  );
};

export const createMockEntity = async (fieldValues?: Partial<Entity>) => {
  const mockModels = createMockModelsStub();

  return mockModels.entity.createTypeInstance({
    code: 'MELB',
    name: 'Melbourne',
    point: JSON.stringify({ type: 'Point', coordinates: [144.986, -37.915] }),
    ...fieldValues,
  });
};

export const createMockModelsStub = (responseMap?: MockModelResponseMap) => {
  const mockModels = {
    entity: new EntityModel({ fetchSchemaForTable: () => {} }), // no database
    dataSource: {
      getTypes: () => ({
        DATA_ELEMENT: 'dataElement',
        DATA_GROUP: 'dataGroup',
        SYNC_GROUP: 'syncGroup',
      }),
    },
  } as DataBrokerModelRegistry;

  if (responseMap && responseMap.entity && responseMap.entity.find) {
    mockModels.entity.find = jest.fn().mockResolvedValue(responseMap.entity.find);
  }

  if (responseMap && responseMap.dataSource && responseMap.dataSource.find) {
    mockModels.dataSource.find = jest.fn().mockResolvedValue(responseMap.dataSource.find);
  }

  if (responseMap && responseMap.dataSource && responseMap.dataSource.getDataElementsInGroup) {
    mockModels.dataSource.getDataElementsInGroup = jest
      .fn()
      .mockResolvedValue(responseMap.dataSource.getDataElementsInGroup);
  }

  return mockModels;
};

export const createMockModelsStubWithMockEntity = async (fieldValues?: Entity) => {
  const mockEntity = await createMockEntity(fieldValues);

  const mockModels = createMockModelsStub({
    entity: {
      find: [mockEntity],
    },
    dataSource: {
      find: [{ code: 'WTHR_PRECIP', type: 'dataElement', config: {} }],
      getDataElementsInGroup: [{ code: 'WTHR_PRECIP', type: 'dataElement', config: {} }], // the mock data group has element PRECIP
    },
  });

  return mockModels;
};

export const getMockDataSourcesArg = (
  overrides?: Partial<DataSourceInstance>,
): DataSourceInstance[] => {
  return [
    {
      model: {},
      id: '123_PRECIP',
      code: 'WTHR_PRECIP',
      type: 'dataElement',
      service_type: 'weather',
      config: {},
      ...overrides,
    },
  ];
};

export const getMockTypeArg = (): DataSourceType => {
  return 'dataElement';
};

export const getMockOptionsArg = (overrides?: PullOptions) => {
  return {
    organisationUnitCodes: ['MELB'],
    startDate: undefined,
    endDate: undefined,
    ...overrides,
  };
};
