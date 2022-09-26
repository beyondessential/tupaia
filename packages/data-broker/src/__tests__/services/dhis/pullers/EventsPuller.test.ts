/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import type { DhisApi } from '@tupaia/dhis-api';
import { createModelsStub, stubDhisApi } from '../DhisService.stubs';
import { DATA_GROUPS } from '../DhisService.fixtures';
import * as BuildEvents from '../../../../services/dhis/buildAnalytics/buildEventsFromDhisEventAnalytics';
import { EventsPuller, PullEventsOptions } from '../../../../services/dhis/pullers';
import { DhisTranslator } from '../../../../services/dhis/DhisTranslator';
import { DhisEventAnalytics } from '../../../../services/dhis/types';

describe('EventsPuller', () => {
  const basicOptions = {
    organisationUnitCodes: ['TO'],
    dataServices: [{ isDataRegional: true }],
  };

  let eventsPuller: EventsPuller;
  let dhisApi: DhisApi;

  beforeEach(() => {
    const models = createModelsStub();
    const translator = new DhisTranslator(models);
    eventsPuller = new EventsPuller(models.dataElement, translator);
    dhisApi = stubDhisApi();
  });

  it('throws an error if multiple data groups are provided', async () =>
    expect(
      eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP, DATA_GROUPS.DIFF_GROUP], basicOptions),
    ).toBeRejectedWith(/Cannot .*multiple programs/));

  describe('DHIS API invocation', () => {
    it('correctly invokes the event analytics api in DHIS', async () => {
      await eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], basicOptions);
      expect(dhisApi.getEventAnalytics).toHaveBeenCalledOnceWith(
        expect.objectContaining({ programCode: 'POP01' }),
      );
    });

    it('forces `dataElementIdScheme` option to `code`', async () => {
      await eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
        ...basicOptions,
        dataElementIdScheme: 'id',
      } as PullEventsOptions);
      expect(dhisApi.getEventAnalytics).toHaveBeenCalledOnceWith(
        expect.objectContaining({ dataElementIdScheme: 'code' }),
      );
    });

    it('`dataElementCodes` can be empty', async () => {
      const assertErrorIsNotThrown = async (dataElementCodes?: string[]) =>
        expect(
          eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
            ...basicOptions,
            dataElementCodes,
          }),
        ).toResolve();

      return Promise.all([undefined, []].map(assertErrorIsNotThrown));
    });

    it('supports various API options', async () => {
      const options = {
        dataServices: [{ isDataRegional: true }],
        organisationUnitCodes: ['TO'],
        dataElementCodes: ['POP01', 'POP02'],
        period: '20200427',
        startDate: '20200731',
        endDate: '20200904',
      };

      await eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], options);
      expect(dhisApi.getEventAnalytics).toHaveBeenCalledOnceWith(
        expect.objectContaining({
          // dataServices: [{ isDataRegional: true }], this field is excluded
          organisationUnitCodes: ['TO'],
          dataElementCodes: ['POP01', 'POP02'],
          period: '20200427',
          startDate: '20200731',
          endDate: '20200904',
        }),
      );
    });

    it('translates data source element to DHIS element codes if required', async () => {
      await eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
        ...basicOptions,
        dataElementCodes: ['POP01', 'DIF01'],
      });
      expect(dhisApi.getEventAnalytics).toHaveBeenCalledOnceWith(
        expect.objectContaining({ dataElementCodes: ['POP01', 'DIF01_DHIS'] }),
      );
    });
  });

  describe('data building', () => {
    let buildEventsMock: jest.SpyInstance;

    beforeAll(() => {
      buildEventsMock = jest
        .spyOn(BuildEvents, 'buildEventsFromDhisEventAnalytics')
        .mockReturnValue([]);
    });

    describe('buildEventsFromDhisEventAnalytics() invocation', () => {
      it('simple data elements', async () => {
        const getEventAnalyticsResponse: DhisEventAnalytics = {
          headers: [
            { name: 'POP01', column: 'Population 1', valueType: 'NUMBER' },
            { name: 'POP02', column: 'Population 2', valueType: 'NUMBER' },
          ],
          metaData: {
            items: {
              POP01: { name: 'Population 1' },
              POP02: { name: 'Population 2' },
            },
            dimensions: { POP01: [], POP02: [] },
          },
          rows: [],
        };
        dhisApi = stubDhisApi({ getEventAnalyticsResponse });
        const dataElementCodes = ['POP01', 'POP02'];

        await eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
          ...basicOptions,
          dataElementCodes,
        });
        expect(buildEventsMock).toHaveBeenCalledOnceWith(
          getEventAnalyticsResponse,
          dataElementCodes,
        );
      });

      it('data elements with data source codes different than DHIS2 codes', async () => {
        const getEventAnalyticsResponse: DhisEventAnalytics = {
          headers: [{ name: 'DIF01_DHIS', column: 'Different 1', valueType: 'NUMBER' }],
          metaData: {
            items: {
              DIF01_DHIS: { name: 'Different 1' },
            },
            dimensions: {
              DIF01_DHIS: [],
            },
          },
          rows: [],
        };
        const translatedEventAnalyticsResponse = {
          headers: [{ name: 'DIF01', column: 'Different 1', valueType: 'NUMBER' }],
          metaData: {
            items: {
              DIF01: { name: 'Different 1' },
            },
            dimensions: { DIF01: [] },
          },
          rows: [],
        };
        dhisApi = stubDhisApi({ getEventAnalyticsResponse });

        const dataElementCodes = ['DIF01'];
        await eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
          ...basicOptions,
          dataElementCodes,
        });
        expect(buildEventsMock).toHaveBeenCalledOnceWith(
          translatedEventAnalyticsResponse,
          dataElementCodes,
        );
      });
    });

    it('directly returns the buildEventsFromDhisEventAnalytics() results', () => {
      const events = [
        {
          event: 'event1_dhisId',
          eventDate: '2020-02-06T10:18:00.000',
          orgUnit: 'TO_Nukuhc',
          orgUnitName: 'Nukunuku',
          dataValues: {
            POP01: 1,
            POP02: 2,
          },
        },
      ];
      buildEventsMock.mockReturnValue(events);

      return expect(
        eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], basicOptions),
      ).resolves.toStrictEqual(events);
    });
  });
});
