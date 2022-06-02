import { EntityModel } from '@tupaia/database';
import { createJestMockInstance } from '@tupaia/utils';

export const createWeatherApiStub = (historicDailyResponse, forecastDailyResponse) =>
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

export const createMockEntity = async fieldValues => {
  const mockModels = createMockModelsStub();

  return mockModels.entity.createTypeInstance({
    code: 'MELB',
    name: 'Melbourne',
    point: JSON.stringify({ type: 'Point', coordinates: [144.986, -37.915] }),
    ...fieldValues,
  });
};

export const createMockModelsStub = responseMap => {
  const mockModels = {
    entity: new EntityModel({ fetchSchemaForTable: () => {} }), // no database
    dataElement: {},
    dataGroup: {},
  };

  if (responseMap && responseMap.entity && responseMap.entity.find) {
    mockModels.entity.find = jest.fn().mockResolvedValue(responseMap.entity.find);
  }

  if (responseMap && responseMap.dataElement && responseMap.dataElement.find) {
    mockModels.dataElement.find = jest.fn().mockResolvedValue(responseMap.dataElement.find);
  }

  if (responseMap && responseMap.dataGroup && responseMap.dataGroup.getDataElementsInDataGroup) {
    mockModels.dataGroup.getDataElementsInDataGroup = jest
      .fn()
      .mockResolvedValue(responseMap.dataGroup.getDataElementsInDataGroup);
  }

  return mockModels;
};

export const createMockModelsStubWithMockEntity = async fieldValues => {
  const mockEntity = await createMockEntity(fieldValues);

  const mockModels = createMockModelsStub({
    entity: {
      find: [mockEntity],
    },
    dataElement: {
      find: [{ code: 'WTHR_PRECIP', type: 'dataElement', config: {} }],
    },
    dataGroup: {
      getDataElementsInDataGroup: [{ code: 'WTHR_PRECIP', type: 'dataElement', config: {} }], // the mock data group has element PRECIP
    },
  });

  return mockModels;
};

export const getMockDataSourcesArg = overrides => {
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

export const getMockTypeArg = () => {
  return 'dataElement';
};

export const getMockOptionsArg = overrides => {
  return {
    organisationUnitCodes: ['MELB'],
    startDate: undefined,
    endDate: undefined,
    ...overrides,
  };
};
