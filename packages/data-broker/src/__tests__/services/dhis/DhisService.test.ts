/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DhisApi } from '@tupaia/dhis-api';
import * as GetDhisApiInstance from '../../../services/dhis/getDhisApiInstance';
import {
  DATA_ELEMENTS,
  DATA_VALUES,
  DATA_GROUPS,
  DHIS_REFERENCE,
  SERVER_NAME,
} from './DhisService.fixtures';
import { DhisService } from '../../../services/dhis';
import { createModelsStub, stubDhisApi } from './DhisService.stubs';

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

  describe('push()', () => {
    let dhisApi: DhisApi;

    beforeEach(() => {
      // recreate stub so spy calls are reset
      dhisApi = stubDhisApi();
    });

    describe('data element', () => {
      it('basic aggregate data element', async () => {
        await dhisService.push([DATA_ELEMENTS.POP01], DATA_VALUES.POP01, { type: 'dataElement' });
        expect(dhisApi.postDataValueSets).toHaveBeenCalledOnceWith([
          { dataElement: 'POP01', value: '1', orgUnit: 'TO', period: '20210101' },
        ]);
      });

      it('aggregate data element with a different dhis code', async () => {
        await dhisService.push([DATA_ELEMENTS.DIF01], DATA_VALUES.DIF01, { type: 'dataElement' });
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
          event: 'eventId',
          eventDate: '2020-02-06T10:18:00.000',
          orgUnit: 'TO',
          orgUnitName: 'Tonga',
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

  describe('delete()', () => {
    let dhisApi: DhisApi;

    beforeEach(() => {
      // recreate stub so spy calls are reset
      dhisApi = stubDhisApi();
    });

    describe('data element', () => {
      it('deletes a basic aggregate data element', async () => {
        await dhisService.delete(DATA_ELEMENTS.POP01, DATA_VALUES.POP01, {
          serverName: SERVER_NAME,
          type: 'dataElement',
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
        });
        expect(dhisApi.deleteEvent).toHaveBeenCalledOnceWith(DHIS_REFERENCE);
      });
    });
  });

  describe('pull()', () => {
    describe('puller resolution', () => {
      const dhisApi = stubDhisApi();
      const eventOptions = {
        organisationUnitCodes: ['TO'],
        dataServices: [{ isDataRegional: true }],
      };

      beforeEach(() => {
        jest.spyOn(GetDhisApiInstance, 'getDhisApiInstance').mockReturnValueOnce(dhisApi);
      });

      it('uses AnalyticsPuller for dataElements', async () => {
        await dhisService.pull([DATA_ELEMENTS.POP01], 'dataElement', {});
        expect(mockPullAnalytics).toHaveBeenCalledOnceWith([dhisApi], [DATA_ELEMENTS.POP01], {});
      });

      it('uses EventsPuller for dataGroups', async () => {
        await dhisService.pull([DATA_GROUPS.POP01_GROUP], 'dataGroup', eventOptions);
        expect(mockPullEvents).toHaveBeenCalledOnceWith(
          [dhisApi],
          [DATA_GROUPS.POP01_GROUP],
          eventOptions,
        );
      });

      it('uses the modern EventsPuller by default', async () => {
        await dhisService.pull([DATA_GROUPS.POP01_GROUP], 'dataGroup', eventOptions);
        expect(mockPullEvents).toHaveBeenCalledTimes(1);
        expect(mockPullDeprecatedEvents).not.toHaveBeenCalled();
      });

      it('uses the deprecated EventsPuller if flag passed', async () => {
        await dhisService.pull([DATA_GROUPS.POP01_GROUP], 'dataGroup', {
          ...eventOptions,
          useDeprecatedApi: true,
        });
        expect(mockPullEvents).not.toHaveBeenCalled();
        expect(mockPullDeprecatedEvents).toHaveBeenCalledTimes(1);
      });
    });

    describe('api resolution', () => {
      let getDhisApiInstanceSpy: jest.SpyInstance;
      const dhisApiA = stubDhisApi();
      const dhisApiB = stubDhisApi();

      beforeEach(() => {
        getDhisApiInstanceSpy = jest.spyOn(GetDhisApiInstance, 'getDhisApiInstance');
      });

      it('has a default data service', async () => {
        const dataSources = [DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02];
        const options = {
          organisationUnitCodes: ['TO'],
        };

        getDhisApiInstanceSpy.mockReturnValue(dhisApiA);

        await dhisService.pull(dataSources, 'dataElement', options);

        // expect DhisService to ask for the api for the default data service
        const expectedDefaultConfig = { isDataRegional: true };
        expect(getDhisApiInstanceSpy).toHaveBeenCalledOnceWith(
          { entityCodes: ['TO'], ...expectedDefaultConfig },
          expect.anything(),
        );

        // expect those apis to be passed to pull
        expect(mockPullAnalytics).toHaveBeenCalledOnceWith(
          [dhisApiA],
          expect.anything(),
          expect.anything(),
        );
      });

      it('allows data services to be explicitly specified', async () => {
        const dataSources = [DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02];
        const options = {
          organisationUnitCodes: ['TO'],
          dataServices: [{ isDataRegional: true }, { isDataRegional: false }],
        };

        getDhisApiInstanceSpy.mockReturnValueOnce(dhisApiA).mockReturnValueOnce(dhisApiB);

        await dhisService.pull(dataSources, 'dataElement', options);

        // expect DhisService to ask for the apis for the given data services
        expect(getDhisApiInstanceSpy).toHaveBeenCalledTimes(2);
        expect(getDhisApiInstanceSpy).toHaveBeenNthCalledWith(
          1,
          { entityCodes: ['TO'], isDataRegional: true },
          expect.anything(),
        );
        expect(getDhisApiInstanceSpy).toHaveBeenNthCalledWith(
          2,
          { entityCodes: ['TO'], isDataRegional: false },
          expect.anything(),
        );

        // expect those apis to be passed to pull
        expect(mockPullAnalytics).toHaveBeenCalledOnceWith(
          [dhisApiA, dhisApiB],
          expect.anything(),
          expect.anything(),
        );
      });

      it('allows flag detectDataServices', async () => {
        const dataSources = [
          {
            ...DATA_ELEMENTS.POP01,
            config: { isDataRegional: false },
          },
          {
            ...DATA_ELEMENTS.POP02,
            config: { isDataRegional: true },
          },
        ];
        const options = {
          organisationUnitCodes: ['TO'],
          detectDataServices: true,
        };

        getDhisApiInstanceSpy.mockReturnValueOnce(dhisApiA).mockReturnValueOnce(dhisApiB);

        await dhisService.pull(dataSources, 'dataElement', options);

        expect(getDhisApiInstanceSpy).toHaveBeenCalledTimes(2);
        expect(getDhisApiInstanceSpy).toHaveBeenNthCalledWith(
          1,
          { entityCodes: ['TO'], isDataRegional: false },
          expect.anything(),
        );
        expect(getDhisApiInstanceSpy).toHaveBeenNthCalledWith(
          2,
          { entityCodes: ['TO'], isDataRegional: true },
          expect.anything(),
        );

        // expect those apis to be passed to pull
        expect(mockPullAnalytics).toHaveBeenCalledOnceWith(
          [dhisApiA, dhisApiB],
          expect.anything(),
          expect.anything(),
        );
      });

      it('only passes unique apis it gets to pull', async () => {
        // (See RN-104)
        const dataSources = [DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02];
        const options = {
          organisationUnitCodes: ['TO'],
          dataServices: [{ isDataRegional: true }, { isDataRegional: false }],
        };

        // Note: this assumes getDhisApiInstance returns the same object for the same api
        // Covered by test in web-config-server:
        //   - getDhisApiInstance()
        //     - should return the same api object for the same api
        const myDhisApi = dhisApiA;
        getDhisApiInstanceSpy.mockReturnValue(myDhisApi);

        await dhisService.pull(dataSources, 'dataElement', options);

        // expect DhisService to ask for the apis for the given data services
        expect(getDhisApiInstanceSpy).toHaveBeenNthCalledWith(
          1,
          { entityCodes: ['TO'], isDataRegional: true },
          expect.anything(),
        );
        expect(getDhisApiInstanceSpy).toHaveBeenNthCalledWith(
          2,
          { entityCodes: ['TO'], isDataRegional: false },
          expect.anything(),
        );

        // expect those apis to be passed to pull
        expect(mockPullAnalytics).toHaveBeenCalledOnceWith(
          [dhisApiA],
          expect.anything(),
          expect.anything(),
        );
      });
    });
  });
});
