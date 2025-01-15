import * as GetDhisApi from '../../../services/dhis/getDhisApi';
import {
  DATA_ELEMENTS,
  DATA_VALUES,
  DATA_GROUPS,
  DHIS_REFERENCE,
  SERVER_NAME,
  DEFAULT_DATA_SERVICE_MAPPING,
} from './DhisService.fixtures';
import { DhisService } from '../../../services/dhis';
import { createMockDhisApi, createModelsStub, stubGetDhisApi } from './DhisService.stubs';

const mockPullAnalytics = jest.fn();
const mockPullEvents = jest.fn();
const mockPullDeprecatedEvents = jest.fn();

jest.mock('../../../services/dhis/pullers', () => ({
  AnalyticsPuller: jest.fn().mockImplementation(() => ({
    pull: mockPullAnalytics,
  })),
  DataElementsMetadataPuller: jest.fn().mockImplementation(() => ({
    pull: jest.fn(),
  })),
  DataGroupMetadataPuller: jest.fn().mockImplementation(() => ({
    pull: jest.fn(),
  })),
  DeprecatedEventsPuller: jest.fn().mockImplementation(() => ({
    pull: mockPullDeprecatedEvents,
  })),
  EventsPuller: jest.fn().mockImplementation(() => ({
    pull: mockPullEvents,
  })),
}));

describe('DhisService', () => {
  const models = createModelsStub();
  const dhisService = new DhisService(models);
  const dhisApi = createMockDhisApi();
  stubGetDhisApi(dhisApi);

  describe('push()', () => {
    describe('push functionality', () => {
      describe('data element', () => {
        it('basic aggregate data element', async () => {
          await dhisService.push([DATA_ELEMENTS.POP01], DATA_VALUES.POP01, {
            type: 'dataElement',
            dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
          });
          expect(dhisApi.postDataValueSets).toHaveBeenCalledOnceWith([
            { dataElement: 'POP01', value: '1', orgUnit: 'TO', period: '20210101' },
          ]);
        });

        it('aggregate data element with a different dhis code', async () => {
          await dhisService.push([DATA_ELEMENTS.DIF01], DATA_VALUES.DIF01, {
            type: 'dataElement',
            dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
          });
          expect(dhisApi.postDataValueSets).toHaveBeenCalledOnceWith([
            { dataElement: 'DIF01_DHIS', value: '3', orgUnit: 'TO', period: '20210101' },
          ]);
        });
      });

      describe('data group', () => {
        it('event data group', async () => {
          const event = {
            event: 'eventId',
            eventDate: '2020-02-06T10:18:00.000',
            orgUnit: 'TO',
            orgUnitName: 'Tonga',
            otherField: 'otherValue',
            dataValues: [DATA_VALUES.POP01, DATA_VALUES.POP02],
          };

          await dhisService.push([DATA_GROUPS.POP01_GROUP], event, {
            type: 'dataGroup',
            dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
          });
          expect(dhisApi.postEvents).toHaveBeenCalledOnceWith([
            {
              ...event,
              dataValues: [
                { dataElement: 'id000POP01', value: '1' },
                { dataElement: 'id000POP02', value: '2' },
              ],
            },
          ]);
        });

        it('event data group with a different dhis code', async () => {
          const event = {
            event: 'eventId',
            eventDate: '2020-02-06T10:18:00.000',
            orgUnit: 'TO',
            orgUnitName: 'Tonga',
            otherField: 'otherValue',
            dataValues: [DATA_VALUES.POP01, DATA_VALUES.DIF01],
          };

          await dhisService.push([DATA_GROUPS.POP01_GROUP], event, {
            type: 'dataGroup',
            dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
          });
          expect(dhisApi.postEvents).toHaveBeenCalledOnceWith([
            {
              ...event,
              dataValues: [
                {
                  dataElement: 'id000POP01',
                  value: '1',
                },
                {
                  dataElement: 'id000DIF01_DHIS',
                  value: '3',
                },
              ],
            },
          ]);
        });
      });
    });

    describe('push api resolution', () => {
      const getApiForDataSourceSpy = jest.spyOn(GetDhisApi, 'getApiForDataSource');

      it('throws if data sources use different dhis instances', async () => {
        getApiForDataSourceSpy
          .mockResolvedValueOnce(createMockDhisApi({ serverName: 'myDhisApi1' }))
          .mockResolvedValueOnce(createMockDhisApi({ serverName: 'myDhisApi2' }));

        const run = async () =>
          dhisService.push(
            [DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02],
            [DATA_VALUES.POP01, DATA_VALUES.POP02],
            { type: 'dataElement', dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING },
          );

        return expect(run()).toBeRejectedWith(
          'All data being pushed must be for the same DHIS2 instance',
        );
      });

      it('looks up the api from the given data source', async () => {
        getApiForDataSourceSpy.mockResolvedValue(createMockDhisApi());

        await dhisService.push([DATA_ELEMENTS.POP01], [DATA_VALUES.POP01], {
          type: 'dataElement',
          dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
        });

        // implementation calls getApiForDataSource multiple times, we don't test each one as args should be the same every time
        expect(getApiForDataSourceSpy).toHaveBeenLastCalledWith(
          expect.anything(),
          DATA_ELEMENTS.POP01,
          DEFAULT_DATA_SERVICE_MAPPING,
        );
      });
    });
  });

  describe('delete()', () => {
    describe('delete functionality', () => {
      describe('data element', () => {
        it('deletes a basic aggregate data element', async () => {
          await dhisService.delete(DATA_ELEMENTS.POP01, DATA_VALUES.POP01, {
            serverName: SERVER_NAME,
            type: 'dataElement',
            dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
          });
          expect(dhisApi.deleteDataValue).toHaveBeenCalledOnceWith({
            dataElement: 'POP01',
            value: '1',
            orgUnit: 'TO',
            period: '20210101',
          });
        });

        it('deletes an aggregate data element with a different dhis code', async () => {
          await dhisService.delete(DATA_ELEMENTS.DIF01, DATA_VALUES.DIF01, {
            serverName: SERVER_NAME,
            type: 'dataElement',
            dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
          });
          expect(dhisApi.deleteDataValue).toHaveBeenCalledOnceWith({
            dataElement: 'DIF01_DHIS',
            value: '3',
            orgUnit: 'TO',
            period: '20210101',
          });
        });
      });

      describe('data group', () => {
        it('deletes an event', async () => {
          const eventData = {
            dhisReference: DHIS_REFERENCE,
          };

          await dhisService.delete(DATA_GROUPS.POP01_GROUP, eventData, {
            serverName: SERVER_NAME,
            type: 'dataGroup',
            dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
          });
          expect(dhisApi.deleteEvent).toHaveBeenCalledOnceWith(DHIS_REFERENCE);
        });
      });
    });

    describe('delete api resolution', () => {
      const getApiForDataSourceSpy = jest.spyOn(GetDhisApi, 'getApiForDataSource');
      const getApiFromServerNameSpy = jest.spyOn(GetDhisApi, 'getApiFromServerName');

      it('allows specifying serverName', async () => {
        getApiFromServerNameSpy.mockResolvedValue(createMockDhisApi());

        await dhisService.delete(DATA_ELEMENTS.POP01, DATA_VALUES.POP01, {
          serverName: 'some server name',
          type: 'dataElement',
          dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
        });

        expect(getApiFromServerNameSpy).toHaveBeenCalledOnceWith(
          expect.anything(),
          'some server name',
        );
      });

      it('looks up the api from the given data source', async () => {
        getApiForDataSourceSpy.mockResolvedValue(createMockDhisApi());

        await dhisService.delete(DATA_ELEMENTS.POP01, DATA_VALUES.POP01, {
          type: 'dataElement',
          dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
        });

        expect(getApiForDataSourceSpy).toHaveBeenCalledOnceWith(
          expect.anything(),
          DATA_ELEMENTS.POP01,
          DEFAULT_DATA_SERVICE_MAPPING,
        );
      });
    });
  });

  describe('pullAnalytics()', () => {
    const getApisForDataSourcesSpy = jest.spyOn(GetDhisApi, 'getApisForDataSources');

    it('uses AnalyticsPuller to fetch data', async () => {
      await dhisService.pullAnalytics([DATA_ELEMENTS.POP01], {
        dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
      });

      getApisForDataSourcesSpy.mockResolvedValue([dhisApi]);

      expect(mockPullAnalytics).toHaveBeenCalledOnceWith([dhisApi], [DATA_ELEMENTS.POP01], {
        dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
      });
    });

    it('looks up the api from the given data element', async () => {
      const dataElements = [DATA_ELEMENTS.POP01];
      const options = {
        organisationUnitCodes: ['TO'],
        dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
      };

      const mockedDhisApi1 = createMockDhisApi({ serverName: 'myDhisApi1' });
      getApisForDataSourcesSpy.mockResolvedValue([mockedDhisApi1]);

      await dhisService.pullAnalytics(dataElements, options);

      // expect DhisService to ask for the apis for the given data elements
      expect(getApisForDataSourcesSpy).toHaveBeenCalledOnceWith(
        expect.anything(),
        dataElements,
        DEFAULT_DATA_SERVICE_MAPPING,
      );

      // expect those apis to be passed to pull
      expect(mockPullAnalytics).toHaveBeenCalledOnceWith(
        [mockedDhisApi1],
        expect.anything(),
        expect.anything(),
      );
    });

    it('ignores non-dhis data elements', async () => {
      const dataElements = [DATA_ELEMENTS.POP01, DATA_ELEMENTS.NON_DHIS_1];
      const options = {
        organisationUnitCodes: ['TO'],
        dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
      };

      const mockedDhisApi1 = createMockDhisApi({ serverName: 'myDhisApi1' });
      getApisForDataSourcesSpy.mockResolvedValue([mockedDhisApi1]);

      await dhisService.pullAnalytics(dataElements, options);

      // expect DhisService to ask for the apis for the given data elements, except non-DHIS ones
      expect(getApisForDataSourcesSpy).toHaveBeenCalledOnceWith(
        expect.anything(),
        [DATA_ELEMENTS.POP01],
        DEFAULT_DATA_SERVICE_MAPPING,
      );

      // expect pull to have been called with the given data elements, except non-DHIS ones
      expect(mockPullAnalytics).toHaveBeenCalledOnceWith(
        [mockedDhisApi1],
        [DATA_ELEMENTS.POP01],
        expect.anything(),
      );
    });
  });

  describe('pullEvents()', () => {
    const basicEventOptions = {
      dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
      organisationUnitCodes: ['TO'],
    };

    const getApisForDataSourcesSpy = jest.spyOn(GetDhisApi, 'getApisForDataSources');

    beforeEach(() => {
      getApisForDataSourcesSpy.mockClear();
    });

    it('uses EventsPuller to fetch data', async () => {
      const eventOptions = {
        ...basicEventOptions,
        dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
      };

      getApisForDataSourcesSpy.mockResolvedValue([dhisApi]);

      await dhisService.pullEvents([DATA_GROUPS.POP01_GROUP], eventOptions);
      expect(mockPullEvents).toHaveBeenCalledOnceWith(
        [dhisApi],
        [DATA_GROUPS.POP01_GROUP],
        eventOptions,
      );
    });

    it('uses the modern EventsPuller by default', async () => {
      await dhisService.pullEvents([DATA_GROUPS.POP01_GROUP], basicEventOptions);
      expect(mockPullEvents).toHaveBeenCalledTimes(1);
      expect(mockPullDeprecatedEvents).not.toHaveBeenCalled();
    });

    it('uses the deprecated EventsPuller if flag passed', async () => {
      await dhisService.pullEvents([DATA_GROUPS.POP01_GROUP], {
        ...basicEventOptions,
        useDeprecatedApi: true,
      });
      expect(mockPullEvents).not.toHaveBeenCalled();
      expect(mockPullDeprecatedEvents).toHaveBeenCalledTimes(1);
    });

    it('looks up the api from the given data element', async () => {
      const dataGroups = [DATA_GROUPS.POP01_GROUP];
      const options = {
        organisationUnitCodes: ['TO'],
        dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
      };

      const mockedDhisApi1 = createMockDhisApi({ serverName: 'myDhisApi1' });
      getApisForDataSourcesSpy.mockResolvedValue([mockedDhisApi1]);

      await dhisService.pullEvents(dataGroups, options);

      // expect DhisService to ask for the apis for the given data elements
      expect(getApisForDataSourcesSpy).toHaveBeenCalledOnceWith(
        expect.anything(),
        dataGroups,
        DEFAULT_DATA_SERVICE_MAPPING,
      );

      // expect those apis to be passed to pull
      expect(mockPullEvents).toHaveBeenCalledOnceWith(
        [mockedDhisApi1],
        expect.anything(),
        expect.anything(),
      );
    });

    it('ignores non-dhis data groups', async () => {
      const dataGroups = [DATA_GROUPS.POP01_GROUP, DATA_GROUPS.NON_DHIS_2];
      const options = {
        organisationUnitCodes: ['TO'],
        dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
      };

      const mockedDhisApi1 = createMockDhisApi({ serverName: 'myDhisApi1' });
      getApisForDataSourcesSpy.mockResolvedValue([mockedDhisApi1]);

      await dhisService.pullEvents(dataGroups, options);

      // expect DhisService to ask for the apis for the given data elements, except non-DHIS ones
      expect(getApisForDataSourcesSpy).toHaveBeenCalledOnceWith(
        expect.anything(),
        [DATA_GROUPS.POP01_GROUP],
        DEFAULT_DATA_SERVICE_MAPPING,
      );

      // expect pull to have been called with the given data elements, except non-DHIS ones
      expect(mockPullEvents).toHaveBeenCalledOnceWith(
        [mockedDhisApi1],
        [DATA_GROUPS.POP01_GROUP],
        expect.anything(),
      );
    });
  });

  describe('pullSyncGroupResults()', () => {
    it('throws an error', async () =>
      expect(dhisService.pullSyncGroupResults()).toBeRejectedWith('not supported'));
  });
});
