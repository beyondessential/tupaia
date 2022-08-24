/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createMockDhisApi, createModelsStub, stubGetDhisApi } from '../DhisService.stubs';
import { DATA_GROUPS } from '../DhisService.fixtures';
import * as BuildEventAnalytics from '../../../../services/dhis/builders/buildEventsFromDhisEventAnalytics';
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

  it('throws an error if no organisationUnitCodes provided', async () =>
    expect(eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {})).toBeRejectedWith(
      /.*requires at least one entity/,
    ));

  it('throws an error if fetching for tracked entities and no hierarchy provided', async () =>
    expect(
      eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
        organisationUnitCodes: ['DL_HOUSEHOLD_1'],
      }),
    ).toBeRejectedWith(/Must specify hierarchy .* tracked entity instances/));

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

  describe('pulling events', () => {
    it('can pull events', async () => {
      const getEventAnalyticsResponse = {
        headers: [{ name: 'POP01', column: 'Population 1', valueType: 'NUMBER' }],
        metaData: {
          items: {
            POP01: { name: 'Population 1' },
          },
          dimensions: { POP01: [] },
        },
        rows: [[5], [4]],
      };

      dhisApi = createMockDhisApi({ getEventAnalyticsResponse });
      stubGetDhisApi(dhisApi);
      const dataElementCodes = ['POP01', 'POP02'];
      const organisationUnitCodes = ['DL_FACILITY_A'];

      const events = await eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
        dataElementCodes,
        organisationUnitCodes,
      });

      expect(events).toEqual([{ dataValues: { POP01: 5 } }, { dataValues: { POP01: 4 } }]);
    });

    it('sorts events by eventDate', async () => {
      const getEventAnalyticsResponse = {
        headers: [
          { name: 'POP01', column: 'Population 1', valueType: 'NUMBER' },
          { name: 'eventdate', column: 'Event Date', valueType: 'DATE' },
        ],
        metaData: {
          items: {
            POP01: { name: 'Population 1' },
          },
          dimensions: { POP01: [] },
        },
        rows: [
          [5, '2022-08-08 08:00:00.0'],
          [7, '2022-08-07 08:00:00.0'],
          [3, '2022-08-06 08:00:00.0'],
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
        { eventDate: '2022-08-06 08:00:00.0', dataValues: { POP01: 3 } },
        { eventDate: '2022-08-07 08:00:00.0', dataValues: { POP01: 7 } },
        { eventDate: '2022-08-08 08:00:00.0', dataValues: { POP01: 5 } },
      ]);
    });

    it('can pull data for just the requested tracked entity instance', async () => {
      // Return data for all children of the parent org unit
      const getEventAnalyticsStub = ({ organisationUnitCodes }) => {
        // This check isn't actually necessary, but having it here to make explicit that
        // we are pulling data for the parent org unit (and not the child tracked entity)
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
            {
              name: 'oucode',
              column: 'Organisation Unit Code',
              valueType: 'TEXT',
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
            [7, 'tracked_entity_id_dl_household_1', 'DL_FACILITY_A'],
            [5, 'tracked_entity_id_dl_household_2', 'DL_FACILITY_A'],
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
          orgUnit: 'DL_FACILITY_A',
          trackedEntityCode: 'DL_HOUSEHOLD_1',
          trackedEntityId: 'tracked_entity_id_dl_household_1',
        },
      ]);
    });
  });

  describe('data building', () => {
    describe('buildEventsFromDhisEventAnalytics() invocation', () => {
      let buildEventsMock;

      beforeAll(() => {
        buildEventsMock = jest.spyOn(BuildEventAnalytics, 'buildEventsFromDhisEventAnalytics');
      });

      afterAll(() => {
        buildEventsMock.mockRestore();
      });

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
        dhisApi = createMockDhisApi({ getEventAnalyticsResponse });
        stubGetDhisApi(dhisApi);
        const dataElementCodes = ['POP01', 'POP02'];
        const organisationUnitCodes = ['DL_FACILITY_A'];

        await eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
          dataElementCodes,
          organisationUnitCodes,
        });

        expect(buildEventsMock).toHaveBeenCalledOnceWith(
          expect.anything(),
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

        dhisApi = createMockDhisApi({ getEventAnalyticsResponse });
        stubGetDhisApi(dhisApi);
        const dataElementCodes = ['DIF01'];
        const organisationUnitCodes = ['DL_FACILITY_A'];

        await eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
          dataElementCodes,
          organisationUnitCodes,
        });

        expect(buildEventsMock).toHaveBeenCalledOnceWith(
          expect.anything(),
          translatedEventAnalyticsResponse,
          dataElementCodes,
        );
      });
    });
  });
});
