import sinon from 'sinon';
import { WeatherApi } from '@tupaia/weather-api';
import { EntityModel, ModelRegistry } from '@tupaia/database';

export const createWeatherApiStub = historicDailyResponse => {
  return sinon.createStubInstance(WeatherApi, {
    historicDaily: sinon.stub().resolves(historicDailyResponse),
  });
};

export const createWeatherApiStubWithMockResponse = () => {
  return createWeatherApiStub({
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
  });
};

export const createMockEntity = async fieldValues => {
  const mockModels = createMockModelsStub();

  return mockModels.entity.createTypeInstance({
    code: 'MELB',
    point: JSON.stringify({ type: 'Point', coordinates: [144.986, -37.915] }),
    timezone: 'Australia/Melbourne',
    ...fieldValues,
  });
};

export const createMockModelsStub = responseMap => {
  const mockModels = {
    entity: new EntityModel({}), // no database
    dataSource: {
      getTypes: () => ({ DATA_ELEMENT: 'dataElement', DATA_GROUP: 'dataGroup' }),
    },
  };

  if (responseMap && responseMap.entity && responseMap.entity.find) {
    mockModels.entity.find = sinon.stub().resolves(responseMap.entity.find);
  }

  return mockModels;
};

export const createMockModelsStubWithMockEntity = async fieldValues => {
  const mockEntity = await createMockEntity(fieldValues);

  const mockModels = createMockModelsStub({
    entity: {
      find: [mockEntity],
    },
  });

  return mockModels;
};

export const getMockDataSourcesArg = () => {
  return [
    {
      model: {},
      id: '123_PRECIP',
      code: 'WTHR_PRECIP',
      type: 'dataElement',
      service_type: 'weather',
      config: {},
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
