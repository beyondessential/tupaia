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
      let getApiForValueSpy;

      beforeEach(() => {
        getApiForValueSpy = jest.spyOn(GetDhisApi, 'getApiForValue');
      });

      it('throws if data sources use different dhis instances', async () => {
        getApiForValueSpy
          .mockReturnValueOnce(createMockDhisApi({ serverName: 'myDhisApi1' }))
          .mockReturnValueOnce(createMockDhisApi({ serverName: 'myDhisApi2' }));

        const run = async () =>
          await dhisService.push(
            [DATA_SOURCES.POP01, DATA_SOURCES.POP02],
            [DATA_VALUES.POP01, DATA_VALUES.POP02],
          );

        return expect(run()).toBeRejectedWith(
          'All data being pushed must be for the same DHIS2 instance',
        );
      });

      it('looks up the api from the given data source', async () => {
        getApiForValueSpy.mockReturnValue(createMockDhisApi());

        await dhisService.push([DATA_SOURCES.POP01], [DATA_VALUES.POP01]);

        // implementation calls getApiForValue multiple times, we don't test each one as args should be the same every time
        expect(getApiForValueSpy).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.anything(),
          DATA_SOURCES.POP01,
          DATA_VALUES.POP01,
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
      let getApiForValueSpy;
      let getApiFromServerNameSpy;

      beforeEach(() => {
        getApiForValueSpy = jest.spyOn(GetDhisApi, 'getApiForValue');
        getApiFromServerNameSpy = jest.spyOn(GetDhisApi, 'getApiFromServerName');
      });

      it('allows specifying serverName', async () => {
        getApiFromServerNameSpy.mockReturnValue(createMockDhisApi());

        await dhisService.delete(DATA_GROUPS.POP01, DATA_GROUPS.POP01, {
          serverName: 'some server name',
        });

        expect(getApiFromServerNameSpy).toHaveBeenCalledOnceWith(
          expect.anything(),
          'some server name',
        );
      });

      it('looks up the api from the given data source', async () => {
        getApiForValueSpy.mockReturnValue(createMockDhisApi());

        await dhisService.delete(DATA_GROUPS.POP01, DATA_GROUPS.POP01);

        expect(getApiForValueSpy).toHaveBeenCalledOnceWith(
          expect.anything(),
          expect.anything(),
          DATA_GROUPS.POP01,
          DATA_VALUES.POP01,
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
      let getApisForLegacyDataSourceConfigSpy;

      beforeEach(() => {
        getApisForDataSourcesSpy = jest.spyOn(GetDhisApi, 'getApisForDataSources');
        getApisForLegacyDataSourceConfigSpy = jest.spyOn(
          GetDhisApi,
          'getApisForLegacyDataSourceConfig',
        );
      });

      it('has a default data service', async () => {
        const dataSources = [DATA_SOURCES.POP01, DATA_SOURCES.POP02];
        const options = {
          organisationUnitCodes: ['TO'],
        };

        const mockedDhisApi = createMockDhisApi({ serverName: 'myDhisApi1' });
        getApisForLegacyDataSourceConfigSpy.mockReturnValue(mockedDhisApi);

        await dhisService.pull(dataSources, 'dataElement', options);

        expect(getApisForLegacyDataSourceConfigSpy).toHaveBeenCalledOnceWith(
          expect.anything(),
          expect.anything(),
          [{ isDataRegional: true }], // default data service legacy config
          ['TO'],
        );

        // expect those apis to be passed to pull
        expect(dhisService.analyticsPuller.pull).toHaveBeenCalledOnceWith(
          mockedDhisApi,
          expect.anything(),
          expect.anything(),
        );
      });

      it('allows data services to be explicitly specified', async () => {
        const dataSources = [DATA_SOURCES.POP01, DATA_SOURCES.POP02];
        const options = {
          organisationUnitCodes: ['TO'],
          dataServices: [{ isDataRegional: true }, { isDataRegional: false }],
        };

        const mockedDhisApi1 = createMockDhisApi({ serverName: 'myDhisApi1' });
        const mockedDhisApi2 = createMockDhisApi({ serverName: 'myDhisApi2' });
        getApisForLegacyDataSourceConfigSpy.mockReturnValue([mockedDhisApi1, mockedDhisApi2]);

        await dhisService.pull(dataSources, 'dataElement', options);

        // expect DhisService to ask for the apis for the given data services
        expect(getApisForLegacyDataSourceConfigSpy).toHaveBeenCalledOnceWith(
          expect.anything(),
          expect.anything(),
          [{ isDataRegional: true }, { isDataRegional: false }],
          ['TO'],
        );

        // expect those apis to be passed to pull
        expect(dhisService.analyticsPuller.pull).toHaveBeenCalledOnceWith(
          [mockedDhisApi1, mockedDhisApi2],
          expect.anything(),
          expect.anything(),
        );
      });

      it('allows flag detectDataServices', async () => {
        const dataSources = [
          {
            ...DATA_SOURCES.POP01,
            config: { dhisInstanceCode: 'test_dhis_instance_1' },
          },
          {
            ...DATA_SOURCES.POP02,
            config: {}, // no dhisInstanceCode, means we need to resolve dhis instance by entity
          },
        ];
        const options = {
          organisationUnitCodes: ['TO'],
          detectDataServices: true,
        };

        const mockedDhisApi1 = createMockDhisApi({ serverName: 'myDhisApi1' });
        const mockedDhisApi2 = createMockDhisApi({ serverName: 'myDhisApi2' });
        getApisForDataSourcesSpy.mockReturnValue([mockedDhisApi1, mockedDhisApi2]);

        await dhisService.pull(dataSources, 'dataElement', options);

        // expect DhisService to ask for the apis for the given data sources
        expect(getApisForDataSourcesSpy).toHaveBeenCalledOnceWith(
          expect.anything(),
          expect.anything(),
          dataSources,
          ['TO'],
        );

        // expect those apis to be passed to pull
        expect(dhisService.analyticsPuller.pull).toHaveBeenCalledOnceWith(
          [mockedDhisApi1, mockedDhisApi2],
          expect.anything(),
          expect.anything(),
        );
      });
    });
  });
});
