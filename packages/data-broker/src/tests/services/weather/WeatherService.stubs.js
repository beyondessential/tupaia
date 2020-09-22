import sinon from 'sinon';
import { WeatherApi } from '@tupaia/weather-api';
import { EntityModel, ModelRegistry } from '@tupaia/database';

export const createWeatherApiStub = (historicDailyResponse, forecastDailyResponse) => {
  return sinon.createStubInstance(WeatherApi, {
    historicDaily: sinon.stub().resolves(historicDailyResponse),
    forecastDaily: sinon.stub().resolves(forecastDailyResponse),
  });
};

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

  if (responseMap && responseMap.dataSource && responseMap.dataSource.find) {
    mockModels.dataSource.find = sinon.stub().resolves(responseMap.dataSource.find);
  }

  if (responseMap && responseMap.dataSource && responseMap.dataSource.getDataElementsInGroup) {
    mockModels.dataSource.getDataElementsInGroup = sinon
      .stub()
      .resolves(responseMap.dataSource.getDataElementsInGroup);
  }

  return mockModels;
};

export const createMockModelsStubWithMockEntity = async fieldValues => {
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
