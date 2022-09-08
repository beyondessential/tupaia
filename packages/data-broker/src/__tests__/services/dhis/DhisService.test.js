/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import * as GetDhisApi from '../../../services/dhis/getDhisApi';
import {
  DATA_SOURCES,
  DATA_VALUES,
  DATA_GROUPS,
  DHIS_REFERENCE,
  SERVER_NAME,
} from './DhisService.fixtures';
import { DhisService } from '../../../services/dhis';
import { createMockDhisApi, createModelsStub, stubGetDhisApi } from './DhisService.stubs';

describe('DhisService', () => {
  let dhisService;

  beforeEach(() => {
    dhisService = new DhisService(createModelsStub());
    dhisService.analyticsPuller = {
      pull: jest.fn(),
    };
    dhisService.eventsPuller = {
      pull: jest.fn(),
    };
    dhisService.deprecatedEventsPuller = {
      pull: jest.fn(),
    };
    dhisService.pullers.dataElement = dhisService.analyticsPuller.pull;
    dhisService.pullers.dataGroup = dhisService.eventsPuller.pull;
    dhisService.pullers.dataGroup_deprecated = dhisService.deprecatedEventsPuller.pull;
  });

  describe('push()', () => {
    describe('push functionality', () => {
      let dhisApi;

      beforeEach(() => {
        // recreate stub so spy calls are reset
        dhisApi = createMockDhisApi();
        stubGetDhisApi(dhisApi);
      });

      describe('data element', () => {
        it('basic aggregate data element', async () => {
          await dhisService.push([DATA_SOURCES.POP01], DATA_VALUES.POP01, { type: 'dataElement' });
          expect(dhisApi.postDataValueSets).toHaveBeenCalledOnceWith([
            { dataElement: 'POP01', value: '1' },
          ]);
        });

        it('aggregate data element with a different dhis code', async () => {
          await dhisService.push([DATA_SOURCES.DIF01], DATA_VALUES.DIF01, { type: 'dataElement' });
          expect(dhisApi.postDataValueSets).toHaveBeenCalledOnceWith([
            { dataElement: 'DIF01_DHIS', value: '3' },
          ]);
        });
      });

      describe('data group', () => {
        it('event data group', async () => {
          const event = {
            otherField: 'otherValue',
            dataValues: [DATA_VALUES.POP01, DATA_VALUES.POP02],
          };

          await dhisService.push([DATA_GROUPS.POP01_GROUP], event, { type: 'dataGroup' });
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
            otherField: 'otherValue',
            dataValues: [DATA_VALUES.POP01, DATA_VALUES.DIF01],
          };

          await dhisService.push([DATA_GROUPS.POP01_GROUP], event, { type: 'dataGroup' });
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
      let getApiForDataSourceSpy;

      beforeEach(() => {
        getApiForDataSourceSpy = jest.spyOn(GetDhisApi, 'getApiForDataSource');
      });

      it('throws if data sources use different dhis instances', async () => {
        getApiForDataSourceSpy
          .mockReturnValueOnce(createMockDhisApi({ serverName: 'myDhisApi1' }))
          .mockReturnValueOnce(createMockDhisApi({ serverName: 'myDhisApi2' }));

        const run = async () =>
          await dhisService.push(
            [DATA_SOURCES.POP01, DATA_SOURCES.POP02],
            [DATA_VALUES.POP01, DATA_VALUES.POP02],
            { type: 'dataElement' },
          );

        return expect(run()).toBeRejectedWith(
          'All data being pushed must be for the same DHIS2 instance',
        );
      });

      it('looks up the api from the given data source', async () => {
        getApiForDataSourceSpy.mockReturnValue(createMockDhisApi());

        await dhisService.push([DATA_SOURCES.POP01], [DATA_VALUES.POP01], { type: 'dataElement' });

        // implementation calls getApiForDataSource multiple times, we don't test each one as args should be the same every time
        expect(getApiForDataSourceSpy).toHaveBeenLastCalledWith(
          expect.anything(),
          DATA_SOURCES.POP01,
        );
      });
    });
  });

  describe('delete()', () => {
    describe('delete functionality', () => {
      let dhisApi;

      beforeEach(() => {
        // recreate stub so spy calls are reset
        dhisApi = createMockDhisApi();
        stubGetDhisApi(dhisApi);
      });

      describe('data element', () => {
        it('deletes a basic aggregate data element', async () => {
          await dhisService.delete(DATA_SOURCES.POP01, DATA_VALUES.POP01, {
            serverName: SERVER_NAME,
            type: 'dataElement',
          });
          expect(dhisApi.deleteDataValue).toHaveBeenCalledOnceWith({
            dataElement: 'POP01',
            value: '1',
          });
        });

        it('deletes an aggregate data element with a different dhis code', async () => {
          await dhisService.delete(DATA_SOURCES.DIF01, DATA_VALUES.DIF01, {
            serverName: SERVER_NAME,
            type: 'dataElement',
          });
          expect(dhisApi.deleteDataValue).toHaveBeenCalledOnceWith({
            dataElement: 'DIF01_DHIS',
            value: '3',
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
          });
          expect(dhisApi.deleteEvent).toHaveBeenCalledOnceWith(DHIS_REFERENCE);
        });
      });
    });

    describe('delete api resolution', () => {
      let getApiForDataSourceSpy;
      let getApiFromServerNameSpy;

      beforeEach(() => {
        getApiForDataSourceSpy = jest.spyOn(GetDhisApi, 'getApiForDataSource');
        getApiFromServerNameSpy = jest.spyOn(GetDhisApi, 'getApiFromServerName');
      });

      it('allows specifying serverName', async () => {
        getApiFromServerNameSpy.mockReturnValue(createMockDhisApi());

        await dhisService.delete(DATA_SOURCES.POP01, DATA_VALUES.POP01, {
          serverName: 'some server name',
          type: 'dataElement',
        });

        expect(getApiFromServerNameSpy).toHaveBeenCalledOnceWith(
          expect.anything(),
          'some server name',
        );
      });

      it('looks up the api from the given data source', async () => {
        getApiForDataSourceSpy.mockReturnValue(createMockDhisApi());

        await dhisService.delete(DATA_SOURCES.POP01, DATA_VALUES.POP01, {
          type: 'dataElement',
        });

        expect(getApiForDataSourceSpy).toHaveBeenCalledOnceWith(
          expect.anything(),
          DATA_SOURCES.POP01,
        );
      });
    });
  });

  describe('pull()', () => {
    describe('pull functionality', () => {
      it('uses AnalyticsPuller for dataElements', async () => {
        await dhisService.pull([DATA_SOURCES.POP01], 'dataElement', {});
        expect(dhisService.analyticsPuller.pull).toHaveBeenCalledOnceWith(
          expect.anything(),
          [DATA_SOURCES.POP01],
          {},
        );
      });

      it('uses EventsPuller for dataGroups', async () => {
        await dhisService.pull([DATA_GROUPS.POP01_GROUP], 'dataGroup', {});
        expect(dhisService.eventsPuller.pull).toHaveBeenCalledOnceWith(
          expect.anything(),
          [DATA_GROUPS.POP01_GROUP],
          {},
        );
      });

      it('uses the modern EventsPuller by default', async () => {
        await dhisService.pull([DATA_GROUPS.POP01_GROUP], 'dataGroup', {});
        expect(dhisService.eventsPuller.pull).toHaveBeenCalledTimes(1);
        expect(dhisService.deprecatedEventsPuller.pull).not.toHaveBeenCalled();
      });

      it('uses the deprecated EventsPuller if flag passed', async () => {
        await dhisService.pull([DATA_GROUPS.POP01_GROUP], 'dataGroup', { useDeprecatedApi: true });
        expect(dhisService.eventsPuller.pull).not.toHaveBeenCalled();
        expect(dhisService.deprecatedEventsPuller.pull).toHaveBeenCalledTimes(1);
      });
    });

    describe('pull api resolution', () => {
      let getApisForDataSourcesSpy;

      beforeEach(() => {
        getApisForDataSourcesSpy = jest.spyOn(GetDhisApi, 'getApisForDataSources');
      });

      it('looks up the api from the given data source', async () => {
        const dataSources = [
          {
            ...DATA_SOURCES.POP01,
            config: { dhisInstanceCode: 'test_dhis_instance_1' },
          },
        ];
        const options = {
          organisationUnitCodes: ['TO'],
        };

        const mockedDhisApi1 = createMockDhisApi({ serverName: 'myDhisApi1' });
        getApisForDataSourcesSpy.mockReturnValue([mockedDhisApi1]);

        await dhisService.pull(dataSources, 'dataElement', options);

        // expect DhisService to ask for the apis for the given data sources
        expect(getApisForDataSourcesSpy).toHaveBeenCalledOnceWith(expect.anything(), dataSources);

        // expect those apis to be passed to pull
        expect(dhisService.analyticsPuller.pull).toHaveBeenCalledOnceWith(
          [mockedDhisApi1],
          expect.anything(),
          expect.anything(),
        );
      });
    });
  });
});
