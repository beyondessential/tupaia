import { EntityModel } from '@tupaia/database';
import { createJestMockInstance } from '@tupaia/utils';
import { WeatherResult } from '@tupaia/weather-api';
import { DataServiceMapping } from '../../../services/DataServiceMapping';
import { PullOptions } from '../../../services/weather/WeatherService';
import { DataElement } from '../../../services/weather/types';
import { DataBrokerModelRegistry, DataGroup, Entity } from '../../../types';

interface MockModelResponseMap {
  entity?: {
    find?: Entity[];
  };
  dataElement?: {
    find?: DataElement[];
  };
  dataGroup?: {
    find?: DataGroup[];
    getDataElementsInDataGroup?: DataElement[];
  };
}

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
          rh: 67.2,
          precip: 23.6,
          max_temp: 29.8,
          min_temp: 24,
          datetime: '2020-08-20',
        },
        {
          rh: 79.0,
          precip: 5,
          max_temp: 6,
          min_temp: 7,
          datetime: '2020-08-21',
        },
      ],
    },
    {
      data: [
        {
          rh: 90.1,
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

  return mockModels.entity.createRecordInstance({
    code: 'MELB',
    name: 'Melbourne',
    point: JSON.stringify({ type: 'Point', coordinates: [144.986, -37.915] }),
    ...fieldValues,
  });
};

export const createMockModelsStub = (responseMap?: MockModelResponseMap) => {
  const mockModels = {
    entity: new EntityModel({ fetchSchemaForTable: () => {} }), // no database
    dataElement: {},
    dataGroup: {},
  } as unknown as DataBrokerModelRegistry;

  if (responseMap?.entity?.find) {
    mockModels.entity.find = jest.fn().mockResolvedValue(responseMap.entity.find);
  }

  if (responseMap?.dataElement?.find) {
    mockModels.dataElement.find = jest.fn().mockResolvedValue(responseMap.dataElement.find);
  }

  if (responseMap?.dataGroup?.getDataElementsInDataGroup) {
    mockModels.dataGroup.getDataElementsInDataGroup = jest
      .fn()
      .mockResolvedValue(responseMap.dataGroup.getDataElementsInDataGroup);
  }

  return mockModels;
};

export const createMockModelsStubWithMockEntity = async (fieldValues?: Entity) => {
  const mockEntity = await createMockEntity(fieldValues);

  const mockModels = createMockModelsStub({
    entity: {
      find: [mockEntity],
    },
    dataElement: {
      find: [
        {
          code: 'WTHR_PRECIP',
          dataElementCode: 'WTHR_PRECIP',
          service_type: 'weather',
          config: {},
          permission_groups: ['*'],
        },
      ],
    },
    dataGroup: {
      getDataElementsInDataGroup: [
        // the mock data group has element PRECIP
        {
          code: 'WTHR_PRECIP',
          dataElementCode: 'WTHR_PRECIP',
          service_type: 'weather',
          config: {},
          permission_groups: ['*'],
        },
      ],
    },
  });

  return mockModels;
};

export const getMockDataElementsArg = (overrides?: Partial<DataElement>): DataElement[] => {
  const code = overrides?.code || 'WTHR_PRECIP';
  return [
    {
      code,
      dataElementCode: code,
      service_type: 'weather',
      config: {},
      permission_groups: ['*'],
      ...overrides,
    },
  ];
};

const dataServiceMapping = new DataServiceMapping();

export const getMockOptionsArg = (overrides?: Partial<PullOptions>) => {
  return {
    dataServiceMapping,
    organisationUnitCodes: ['MELB'],
    startDate: undefined,
    endDate: undefined,
    ...overrides,
  };
};
