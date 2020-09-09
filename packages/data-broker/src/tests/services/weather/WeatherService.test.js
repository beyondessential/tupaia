import { expect } from 'chai';
import sinon from 'sinon';
import { WeatherService } from '../../../services/weather';
import {
  createMockModelsStubWithMockEntity,
  createWeatherApiStub,
  createWeatherApiStubWithMockResponse,
  getMockDataSourcesArg,
  getMockOptionsArg,
  getMockTypeArg,
} from './WeatherService.stubs';
import { mockNow, resetMocks } from './testutil';

describe('WeatherService', () => {
  afterEach(() => {
    resetMocks();
  });

  describe('basic operation', () => {
    it('returns analytics data when requesting data for dataElements', async () => {
      const mockModels = await createMockModelsStubWithMockEntity();

      const mockApiResponse = {
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
      };

      const mockApi = createWeatherApiStub(mockApiResponse);

      const service = new WeatherService(mockModels, mockApi);

      const actual = await service.pull(
        [
          {
            model: {},
            id: '12345_PRECIP',
            code: 'PRECIP',
            type: 'dataElement',
            service_type: 'weather',
            config: {},
          },
        ],
        'dataElement',
        getMockOptionsArg(),
      );

      expect(actual.results).to.deep.equal([
        { dataElement: 'PRECIP', value: 23.6, organisationUnit: 'MELB', period: '20200820' },
        { dataElement: 'PRECIP', value: 5, organisationUnit: 'MELB', period: '20200821' },
      ]);
    });

    it('returns events data when requesting data for a dataGroup', async () => {
      const mockModels = await createMockModelsStubWithMockEntity();

      const mockApiResponse = {
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
      };

      const mockApi = createWeatherApiStub(mockApiResponse);

      const service = new WeatherService(mockModels, mockApi);

      const actual = await service.pull(
        [
          {
            model: {},
            id: 'SOME_DATA_GROUP_ID', // data group doesn't matter, it will return the data elements it knows about
            code: 'SOME_DATA_GROUP_CODE',
            type: 'dataGroup',
            service_type: 'weather',
            config: {},
          },
        ],
        'dataGroup',
        getMockOptionsArg(),
      );

      expect(actual.results).to.deep.equal([
        {
          organisationUnit: 'MELB',
          PRECIP: 23.6,
          MAX_TEMP: 29.8,
          MIN_TEMP: 24,
          period: '20200820',
        },
        {
          organisationUnit: 'MELB',
          PRECIP: 5,
          MAX_TEMP: 6,
          MIN_TEMP: 7,
          period: '20200821',
        },
      ]);
    });
  });

  describe('gets current weather', () => {
    it("calls the api with yesterday's date when no dates are provided (simple)", async () => {
      /*
       * Simple case: UTC and local time are the same date
       */
      const mockModels = await createMockModelsStubWithMockEntity({
        timezone: 'Australia/Melbourne',
      });

      const mockApi = createWeatherApiStubWithMockResponse();

      const service = new WeatherService(mockModels, mockApi);

      // Set current server time to:
      // 1549342800
      // 2019-02-05 05:00 UTC
      // 2019-02-05 16:00 Australia/Melbourne
      mockNow(1549342800 * 1000);

      await service.pull(
        getMockDataSourcesArg(),
        getMockTypeArg(),
        getMockOptionsArg({
          startDate: undefined,
          endDate: undefined,
        }),
      );

      expect(mockApi.historicDaily).to.have.callCount(1);

      // Yesterday in Australia/Melbourne (midnight to midnight):
      // 2019-02-04 00:00 to 2019-02-05 00:00
      expect(mockApi.historicDaily.firstCall).to.have.been.calledWith(
        sinon.match.any,
        sinon.match.any,
        '2019-02-04',
        '2019-02-05',
      );
    });

    it("calls the api with yesterday's date when no dates are provided (timezones are fun)", async () => {
      /*
       * Tricky case: UTC and local time are the different dates
       */
      const mockModels = await createMockModelsStubWithMockEntity({
        timezone: 'Australia/Melbourne',
      });

      const mockApi = createWeatherApiStubWithMockResponse();

      const service = new WeatherService(mockModels, mockApi);

      // Set current server time to:
      // 1549382400
      // 2019-02-05 16:00 UTC
      // 2019-02-06 03:00 Australia/Melbourne (note: different date)
      mockNow(1549382400 * 1000);

      await service.pull(
        getMockDataSourcesArg(),
        getMockTypeArg(),
        getMockOptionsArg({
          startDate: undefined,
          endDate: undefined,
        }),
      );

      expect(mockApi.historicDaily).to.have.callCount(1);

      // Yesterday in Australia/Melbourne (midnight to midnight):
      // 2019-02-05 00:00 to 2019-02-06 00:00
      expect(mockApi.historicDaily.firstCall).to.have.been.calledWith(
        sinon.match.any,
        sinon.match.any,
        '2019-02-05',
        '2019-02-06',
      );
    });
  });

  describe('gets historic weather', () => {
    it('calls the api with specific dates when provided', async () => {
      const mockModels = await createMockModelsStubWithMockEntity();

      const mockApi = createWeatherApiStubWithMockResponse();

      const service = new WeatherService(mockModels, mockApi);

      mockNow();

      await service.pull(
        getMockDataSourcesArg(),
        getMockTypeArg(),
        getMockOptionsArg({
          startDate: '2019-01-07',
          endDate: '2019-01-10',
        }),
      );

      expect(mockApi.historicDaily).to.have.callCount(1);

      expect(mockApi.historicDaily.firstCall).to.have.been.calledWith(
        sinon.match.any,
        sinon.match.any,
        '2019-01-07',
        '2019-01-10',
      );
    });
  });
});
