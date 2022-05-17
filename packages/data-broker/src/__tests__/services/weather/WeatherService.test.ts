import { WeatherService } from '../../../services/weather';
import {
  createMockEntity,
  createMockModelsStub,
  createMockModelsStubWithMockEntity,
  createWeatherApiStub,
  createWeatherApiStubWithMockResponse,
  getMockDataSourcesArg,
  getMockOptionsArg,
  getMockTypeArg,
} from './WeatherService.stubs';
import { mockNow } from './testutil';

describe('WeatherService', () => {
  beforeEach(() => {
    mockNow(1549342800 * 1000); // 2019-02-05 05:00 UTC
  });

  describe('basic operation', () => {
    it('returns analytics data when requesting data for dataElements', async () => {
      const mockModels = await createMockModelsStubWithMockEntity();

      const mockHistoricDailyApiResponse = {
        data: [
          {
            precip: 23.6,
            max_temp: 29.8,
            min_temp: 24,
            datetime: '2019-01-20',
          },
          {
            precip: 5,
            max_temp: 6,
            min_temp: 7,
            datetime: '2019-01-21',
          },
        ],
        sources: [],
      };

      const mockApi = createWeatherApiStub(mockHistoricDailyApiResponse);

      const service = new WeatherService(mockModels, mockApi);

      const actual = await service.pull(
        [
          {
            model: {},
            id: '12345_PRECIP',
            code: 'WTHR_PRECIP',
            type: 'dataElement',
            service_type: 'weather',
            config: {},
          },
        ],
        'dataElement',
        getMockOptionsArg({
          startDate: '2019-01-01', // historic data request requires these, but api is mocked so these are ignored
          endDate: '2019-01-02',
        }),
      );

      expect(actual.results).toStrictEqual([
        { dataElement: 'WTHR_PRECIP', value: 23.6, organisationUnit: 'MELB', period: '20190120' },
        { dataElement: 'WTHR_PRECIP', value: 5, organisationUnit: 'MELB', period: '20190121' },
      ]);
    });

    it('returns events data when requesting data for a dataGroup', async () => {
      const mockModels = await createMockModelsStubWithMockEntity();

      const mockHistoricDailyApiResponse = {
        data: [
          {
            precip: 23.6,
            max_temp: 29.8,
            min_temp: 24,
            datetime: '2019-01-20',
          },
          {
            precip: 5,
            max_temp: 6,
            min_temp: 7,
            datetime: '2019-01-21',
          },
        ],
        sources: [],
      };

      const mockApi = createWeatherApiStub(mockHistoricDailyApiResponse);

      const service = new WeatherService(mockModels, mockApi);

      const actual = await service.pull(
        [
          {
            model: {},
            id: 'SOME_DATA_GROUP_ID', // mock data has the data group lookup return element codes [WTHR_PRECIP], data group id/code/name doesnt matter
            code: 'SOME_DATA_GROUP_CODE',
            type: 'dataGroup',
            service_type: 'weather',
            config: {},
          },
        ],
        'dataGroup',
        getMockOptionsArg({
          startDate: '2019-01-01', // historic data request requires these, but api is mocked so these are ignored
          endDate: '2019-01-02',
        }),
      );

      expect(actual).toStrictEqual([
        {
          event: 'weather_MELB_2019-01-20',
          orgUnit: 'MELB',
          orgUnitName: 'Melbourne',
          eventDate: '2019-01-20T23:59:59',
          dataValues: {
            WTHR_PRECIP: 23.6,
          },
        },
        {
          event: 'weather_MELB_2019-01-21',
          orgUnit: 'MELB',
          orgUnitName: 'Melbourne',
          eventDate: '2019-01-21T23:59:59',
          dataValues: {
            WTHR_PRECIP: 5,
          },
        },
      ]);
    });

    it('throws when no dates are provided', async () => {
      const mockModels = await createMockModelsStubWithMockEntity();

      const mockApi = createWeatherApiStubWithMockResponse();

      const service = new WeatherService(mockModels, mockApi);

      const functionCall = async () =>
        await service.pull(
          getMockDataSourcesArg(),
          getMockTypeArg(),
          getMockOptionsArg({
            startDate: undefined,
            endDate: undefined,
          }),
        );

      await expect(functionCall()).toBeRejectedWith('Empty date range not supported');
    });
  });

  describe('gets forecast weather', () => {
    it('calls the forecast api', async () => {
      const mockEntity = await createMockEntity({
        point: JSON.stringify({ type: 'Point', coordinates: [55, -111] }),
      });

      const mockModels = createMockModelsStub({
        entity: {
          find: [mockEntity],
        },
        dataSource: {
          find: [
            {
              code: 'WTHR_FORECAST_PRECIP',
              type: 'dataElement',
              config: { weatherForecastData: true },
            },
          ],
        },
      });

      const mockApi = createWeatherApiStubWithMockResponse();

      const service = new WeatherService(mockModels, mockApi);

      await service.pull(
        getMockDataSourcesArg({
          code: 'WTHR_FORECAST_PRECIP',
        }),
        getMockTypeArg(),
        getMockOptionsArg({
          startDate: '2019-02-05',
          endDate: '2019-02-07',
        }),
      );

      expect(mockApi.forecastDaily).toHaveBeenCalledTimes(1);
      expect(mockApi.forecastDaily).toHaveBeenCalledWith(
        -111,
        55,
        16, // full forecast requested from API, even though only 2 days requested in WeatherService.pull()
      );
    });
  });

  describe('gets historic weather', () => {
    it('calls the historic api', async () => {
      const mockModels = await createMockModelsStubWithMockEntity();

      const mockApi = createWeatherApiStubWithMockResponse();

      const service = new WeatherService(mockModels, mockApi);

      await service.pull(
        getMockDataSourcesArg(),
        getMockTypeArg(),
        getMockOptionsArg({
          startDate: '2019-01-07',
          endDate: '2019-01-10',
        }),
      );

      expect(mockApi.historicDaily).toHaveBeenCalledTimes(1);

      expect(mockApi.historicDaily).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        '2019-01-07',
        '2019-01-11', // (same as input, changed to be exclusive end date)
      );
    });
  });
});
