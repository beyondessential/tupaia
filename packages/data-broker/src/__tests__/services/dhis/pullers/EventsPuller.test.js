/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createMockDhisApi, createModelsStub, stubGetDhisApi } from '../DhisService.stubs';
import { DATA_GROUPS } from '../DhisService.fixtures';
import { EventsPuller } from '../../../../services/dhis/pullers';
import { DhisTranslator } from '../../../../services/dhis/translators/DhisTranslator';

describe('EventsPuller', () => {
  let eventsPuller;
  let dhisApi;

  beforeEach(() => {
    const models = createModelsStub();
    const translator = new DhisTranslator(models);
    eventsPuller = new EventsPuller(models, translator);
    dhisApi = createMockDhisApi();
    stubGetDhisApi(dhisApi);
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
        options: {
          organisationUnitCodes: ['DL_FACILITY_A'],
        },
        invocationArgs: expect.objectContaining({ programCode: 'POP01' }),
      }));

    it('forces `dataElementIdScheme` option to `code`', async () =>
      assertEventAnalyticsApiWasInvokedCorrectly({
        dataSources: [DATA_GROUPS.POP01_GROUP],
        options: { dataElementIdScheme: 'id', organisationUnitCodes: ['DL_FACILITY_A'] },
        invocationArgs: expect.objectContaining({ dataElementIdScheme: 'code' }),
      }));

    it('`dataElementCodes` can be empty', async () => {
      const assertErrorIsNotThrown = async dataElementCodes =>
        expect(
          eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
            dataElementCodes,
            organisationUnitCodes: ['DL_FACILITY_A'],
          }),
        ).toResolve();

      return Promise.all([undefined, []].map(assertErrorIsNotThrown));
    });

    it('supports various API options', async () => {
      const options = {
        dataElementCodes: ['POP01', 'POP02'],
        organisationUnitCodes: ['DL_FACILITY_A'],
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
        options: { dataElementCodes: ['POP01', 'DIF01'], organisationUnitCodes: ['DL_FACILITY_A'] },
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
          rows: [
            [5, 8],
            [4, 3],
          ],
        };
        dhisApi = createMockDhisApi({ getEventAnalyticsResponse });
        stubGetDhisApi(dhisApi);
        const dataElementCodes = ['POP01', 'POP02'];
        const organisationUnitCodes = ['DL_FACILITY_A'];

        const events = await eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
          dataElementCodes,
          organisationUnitCodes,
        });

        expect(events).toEqual([
          { dataValues: { POP01: 5, POP02: 8 } },
          { dataValues: { POP01: 4, POP02: 3 } },
        ]);
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
          rows: [[7], [4]],
        };

        dhisApi = createMockDhisApi({ getEventAnalyticsResponse });
        stubGetDhisApi(dhisApi);
        const dataElementCodes = ['DIF01'];
        const organisationUnitCodes = ['DL_FACILITY_A'];

        const events = await eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
          dataElementCodes,
          organisationUnitCodes,
        });

        expect(events).toEqual([{ dataValues: { DIF01: 7 } }, { dataValues: { DIF01: 4 } }]);
      });

      it('can pull data for just the requested tracked entity instance', async () => {
        const getEventAnalyticsStub = ({ organisationUnitCodes }) => {
          if (organisationUnitCodes[0] !== 'DL_FACILITY_A' || organisationUnitCodes.length !== 1) {
            return {
              headers: [],
              metaData: { items: {}, dimensions: [] },
              rows: [],
            };
          }

          return {
            headers: [
              { name: 'DIF01_DHIS', column: 'Different 1', valueType: 'NUMBER' },
              {
                name: 'tei',
                column: 'Tracked entity instance',
                valueType: 'TEXT',
                meta: true,
              },
            ],
            metaData: {
              items: {
                DIF01_DHIS: { name: 'Different 1' },
              },
              dimensions: {
                DIF01_DHIS: [],
              },
            },
            rows: [
              [7, 'tracked_entity_id_dl_household_1'],
              [5, 'tracked_entity_id_dl_household_2'],
            ],
          };
        };

        dhisApi = createMockDhisApi({ getEventAnalyticsStub });
        stubGetDhisApi(dhisApi);
        const dataElementCodes = ['DIF01'];
        const organisationUnitCodes = ['DL_HOUSEHOLD_1'];
        const hierarchy = 'explore';

        const events = await eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
          dataElementCodes,
          organisationUnitCodes,
          hierarchy,
        });

        expect(events).toEqual([
          {
            dataValues: { DIF01: 7 },
            trackedEntityCode: 'DL_HOUSEHOLD_1',
            trackedEntityId: 'tracked_entity_id_dl_household_1',
          },
        ]);
      });
    });
  });
});
