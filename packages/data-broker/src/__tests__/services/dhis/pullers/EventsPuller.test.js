/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createModelsStub, stubDhisApi } from '../DhisService.stubs';
import { DATA_GROUPS } from '../DhisService.fixtures';
import { buildEventsFromDhisEventAnalytics } from '../../../../services/dhis/builders/buildEventsFromDhisEventAnalytics';
import { EventsPuller } from '../../../../services/dhis/pullers';
import { DhisTranslator } from '../../../../services/dhis/translators/DhisTranslator';

jest.mock('../../../../services/dhis/builders/buildEventsFromDhisEventAnalytics');

describe('EventsPuller', () => {
  let eventsPuller;
  let dhisApi;

  beforeEach(() => {
    const models = createModelsStub();
    const translator = new DhisTranslator(models);
    eventsPuller = new EventsPuller(models.dataElement, translator);
    dhisApi = stubDhisApi();
    buildEventsFromDhisEventAnalytics.mockReturnValue('X');
  });

  it('pulls', async () => {
    const result = await eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
      dataElementCodes: ['POP_01'],
    });
    expect(result).toEqual(['X']); // not sure why but mocked return value is wrapped into an array
  });

  it('throws an error if multiple data groups are provided', async () =>
    expect(
      eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP, DATA_GROUPS.DIFF_GROUP], {}),
    ).toBeRejectedWith(/Cannot .*multiple programs/));

  describe('DHIS API invocation', () => {
    const assertEventAnalyticsApiWasInvokedCorrectly = async ({
      dataSources,
      options = {},
      invocationArgs,
    }) => {
      await eventsPuller.pull([dhisApi], dataSources, options);
      expect(dhisApi.getEventAnalytics).toHaveBeenCalledOnceWith(invocationArgs);
    };

    it('correctly invokes the event analytics api in DHIS', () =>
      assertEventAnalyticsApiWasInvokedCorrectly({
        dataSources: [DATA_GROUPS.POP01_GROUP],
        invocationArgs: expect.objectContaining({ programCode: 'POP01' }),
      }));

    it('forces `dataElementIdScheme` option to `code`', async () =>
      assertEventAnalyticsApiWasInvokedCorrectly({
        dataSources: [DATA_GROUPS.POP01_GROUP],
        options: { dataElementIdScheme: 'id' },
        invocationArgs: expect.objectContaining({ dataElementIdScheme: 'code' }),
      }));

    it('`dataElementCodes` can be empty', async () => {
      const assertErrorIsNotThrown = async dataElementCodes =>
        expect(
          eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], { dataElementCodes }),
        ).toResolve();

      return Promise.all([undefined, []].map(assertErrorIsNotThrown));
    });

    it('supports various API options', async () => {
      const options = {
        dataElementCodes: ['POP01', 'POP02'],
        period: '20200427',
        startDate: '20200731',
        endDate: '20200904',
      };

      return assertEventAnalyticsApiWasInvokedCorrectly({
        dataSources: [DATA_GROUPS.POP01_GROUP],
        options,
        invocationArgs: expect.objectContaining(options),
      });
    });

    it('translates data source element to DHIS element codes if required', () =>
      assertEventAnalyticsApiWasInvokedCorrectly({
        dataSources: [DATA_GROUPS.POP01_GROUP],
        options: { dataElementCodes: ['POP01', 'DIF01'] },
        invocationArgs: expect.objectContaining({ dataElementCodes: ['POP01', 'DIF01_DHIS'] }),
      }));
  });

  describe('data building', () => {
    describe('buildEventsFromDhisEventAnalytics() invocation', () => {
      it('simple data elements', async () => {
        const getEventAnalyticsResponse = {
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
          dataElementCodes,
        });
        expect(buildEventsFromDhisEventAnalytics).toHaveBeenCalledOnceWith(
          getEventAnalyticsResponse,
          dataElementCodes,
        );
      });

      it('data elements with data source codes different than DHIS2 codes', async () => {
        const getEventAnalyticsResponse = {
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
          dataElementCodes,
        });
        expect(buildEventsFromDhisEventAnalytics).toHaveBeenCalledOnceWith(
          translatedEventAnalyticsResponse,
          dataElementCodes,
        );
      });
    });
  });
});
