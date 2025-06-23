import type { DhisApi } from '@tupaia/dhis-api';
import { createMockDhisApi, createModelsStub } from '../DhisService.stubs';
import { DATA_GROUPS } from '../DhisService.fixtures';
import * as BuildEventAnalytics from '../../../../services/dhis/builders/buildEventsFromDhisEventAnalytics';
import { EventsPuller, PullEventsOptions } from '../../../../services/dhis/pullers';
import { DhisTranslator } from '../../../../services/dhis/translators/DhisTranslator';
import { DhisEventAnalytics } from '../../../../services/dhis/types';
import { DataServiceMapping } from '../../../../services/DataServiceMapping';

describe('EventsPuller', () => {
  const basicOptions = {
    dataServiceMapping: new DataServiceMapping(),
    organisationUnitCodes: ['DL_FACILITY_A'],
  };
  const models = createModelsStub();
  const translator = new DhisTranslator(models);
  const eventsPuller = new EventsPuller(models, translator);

  describe('input validation', () => {
    const dhisApi = createMockDhisApi();

    it('throws if multiple data groups are provided', async () =>
      expect(
        eventsPuller.pull(
          [dhisApi],
          [DATA_GROUPS.POP01_GROUP, DATA_GROUPS.DIFF_GROUP],
          basicOptions,
        ),
      ).toBeRejectedWith(/Cannot .*multiple programs/));

    it('throws if no organisationUnitCodes provided', async () =>
      expect(
        eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
          ...basicOptions,
          organisationUnitCodes: [],
        }),
      ).toBeRejectedWith(/.*requires at least one entity/));

    it('throws if fetching for tracked entities and no hierarchy provided', async () =>
      expect(
        eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
          ...basicOptions,
          organisationUnitCodes: ['DL_HOUSEHOLD_1'],
        }),
      ).toBeRejectedWith(/Must specify hierarchy .* tracked entity instances/));
  });

  describe('DHIS API invocation', () => {
    const dhisApi = createMockDhisApi();

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
      const apiOptions = {
        organisationUnitCodes: ['DL_FACILITY_A'],
        dataElementCodes: ['POP01', 'POP02'],
        period: '20200427',
        startDate: '20200731',
        endDate: '20200904',
      };

      await eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
        ...apiOptions,
        dataServiceMapping: new DataServiceMapping(),
      });
      expect(dhisApi.getEventAnalytics).toHaveBeenCalledOnceWith(
        expect.objectContaining(apiOptions),
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

  describe('pulling events', () => {
    it('can pull events', async () => {
      const dhisEventAnalytics: DhisEventAnalytics = {
        headers: [{ name: 'POP01', column: 'Population 1', valueType: 'NUMBER' }],
        metaData: {
          items: {
            POP01: { name: 'Population 1' },
          },
          dimensions: { POP01: [] },
        },
        rows: [['5'], ['4']],
      };
      const dhisApi = createMockDhisApi({
        getEventAnalyticsStub: async () => dhisEventAnalytics,
      });
      const dataElementCodes = ['POP01', 'POP02'];

      const events = await eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
        ...basicOptions,
        dataElementCodes,
      });

      expect(events).toEqual([{ dataValues: { POP01: 5 } }, { dataValues: { POP01: 4 } }]);
    });

    it('sorts events by eventDate', async () => {
      const dhisEventAnalytics: DhisEventAnalytics = {
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
          ['5', '2022-08-08 08:00:00.0'],
          ['7', '2022-08-07 08:00:00.0'],
          ['3', '2022-08-06 08:00:00.0'],
        ],
      };
      const dhisApi = createMockDhisApi({
        getEventAnalyticsStub: async () => dhisEventAnalytics,
      });
      const dataElementCodes = ['POP01', 'POP02'];

      const events = await eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
        ...basicOptions,
        dataElementCodes,
      });

      expect(events).toEqual([
        { eventDate: '2022-08-06 08:00:00.0', dataValues: { POP01: 3 } },
        { eventDate: '2022-08-07 08:00:00.0', dataValues: { POP01: 7 } },
        { eventDate: '2022-08-08 08:00:00.0', dataValues: { POP01: 5 } },
      ]);
    });

    it('can pull data for just the requested tracked entity instance', async () => {
      // Return data for all children of the parent org unit
      const getEventAnalyticsStub: DhisApi['getEventAnalytics'] = async ({
        organisationUnitCodes,
      }) => {
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
            ['7', 'tracked_entity_id_dl_household_1', 'DL_FACILITY_A'],
            ['5', 'tracked_entity_id_dl_household_2', 'DL_FACILITY_A'],
          ],
        };
      };

      const dhisApi = createMockDhisApi({ getEventAnalyticsStub });
      const dataElementCodes = ['DIF01'];
      const organisationUnitCodes = ['DL_HOUSEHOLD_1'];
      const hierarchy = 'explore';

      const events = await eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
        dataServiceMapping: new DataServiceMapping(),
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
      const buildEventsMock = jest.spyOn(BuildEventAnalytics, 'buildEventsFromDhisEventAnalytics');

      afterAll(() => {
        buildEventsMock.mockRestore();
      });

      it('simple data elements', async () => {
        const dhisEventAnalytics: DhisEventAnalytics = {
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
        const dhisApi = createMockDhisApi({
          getEventAnalyticsStub: async () => dhisEventAnalytics,
        });
        const dataElementCodes = ['POP01', 'POP02'];

        await eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
          ...basicOptions,
          dataElementCodes,
        });

        expect(buildEventsMock).toHaveBeenCalledOnceWith(
          models,
          dhisEventAnalytics,
          dataElementCodes,
        );
      });

      it('data elements with data source codes different than DHIS2 codes', async () => {
        const dhisEventAnalytics: DhisEventAnalytics = {
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
        const translatedEventAnalytics = {
          headers: [{ name: 'DIF01', column: 'Different 1', valueType: 'NUMBER' }],
          metaData: {
            items: {
              DIF01: { name: 'Different 1' },
            },
            dimensions: { DIF01: [] },
          },
          rows: [],
        };
        const dhisApi = createMockDhisApi({
          getEventAnalyticsStub: async () => dhisEventAnalytics,
        });
        const dataElementCodes = ['DIF01'];

        await eventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
          ...basicOptions,
          dataElementCodes,
        });

        expect(buildEventsMock).toHaveBeenCalledOnceWith(
          models,
          translatedEventAnalytics,
          dataElementCodes,
        );
      });
    });
  });
});
