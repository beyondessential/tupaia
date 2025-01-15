import { createMockDhisApi, createModelsStub } from '../DhisService.stubs';
import { DATA_GROUPS } from '../DhisService.fixtures';
import {
  DeprecatedEventsPuller,
  DeprecatedPullEventsOptions,
} from '../../../../services/dhis/pullers';
import { DhisTranslator } from '../../../../services/dhis/translators/DhisTranslator';
import { DataServiceMapping } from '../../../../services/DataServiceMapping';

describe('DeprecatedEventsPuller', () => {
  const dataServiceMapping = new DataServiceMapping();
  const basicOptions = {
    dataServiceMapping,
    organisationUnitCodes: ['TO'],
  };
  const models = createModelsStub();
  const translator = new DhisTranslator(models);
  const deprecatedEventsPuller = new DeprecatedEventsPuller(models, translator);

  it('throws an error if multiple data groups are provided', async () =>
    expect(
      deprecatedEventsPuller.pull(
        [createMockDhisApi()],
        [DATA_GROUPS.POP01_GROUP, DATA_GROUPS.DIFF_GROUP],
        basicOptions,
      ),
    ).toBeRejectedWith(/Cannot .*multiple programs/));

  describe('DHIS API invocation', () => {
    const dhisApi = createMockDhisApi();

    it('uses the provided data group as `programCode` option', async () => {
      await deprecatedEventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], basicOptions);
      expect(dhisApi.getEvents).toHaveBeenCalledOnceWith(
        expect.objectContaining({ programCode: 'POP01' }),
      );
    });

    it('forces `dataElementIdScheme` option to `code`', async () => {
      await deprecatedEventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
        ...basicOptions,
        dataElementIdScheme: 'id',
      } as DeprecatedPullEventsOptions);
      expect(dhisApi.getEvents).toHaveBeenCalledOnceWith(
        expect.objectContaining({ dataElementIdScheme: 'code' }),
      );
    });

    it('forces `dataValueFormat` option to `object`', async () => {
      await deprecatedEventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
        ...basicOptions,
        dataValueFormat: 'array',
      } as DeprecatedPullEventsOptions);
      expect(dhisApi.getEvents).toHaveBeenCalledOnceWith(
        expect.objectContaining({ dataValueFormat: 'object' }),
      );
    });

    it('`organisationUnitCodes` can be empty', async () => {
      const assertErrorIsNotThrown = async (organisationUnitCodes?: string[]) =>
        expect(
          deprecatedEventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
            organisationUnitCodes,
          } as DeprecatedPullEventsOptions),
        ).toResolve();

      return Promise.all([undefined, []].map(assertErrorIsNotThrown));
    });

    it('uses the first provided organisation unit code', async () => {
      await deprecatedEventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
        ...basicOptions,
        organisationUnitCodes: ['TO', 'PG'],
      });
      expect(dhisApi.getEvents).toHaveBeenCalledOnceWith(
        expect.objectContaining({ organisationUnitCode: 'TO' }),
      );
    });

    it('supports various API options', async () => {
      const options: DeprecatedPullEventsOptions = {
        dataServiceMapping,
        organisationUnitCodes: ['TO'],
        orgUnitIdScheme: 'code',
        startDate: '20200731',
        endDate: '20200904',
        eventId: '123456',
        trackedEntityInstance: '654321',
      };

      await deprecatedEventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], options);
      expect(dhisApi.getEvents).toHaveBeenCalledOnceWith(
        expect.objectContaining({
          organisationUnitCode: 'TO',
          orgUnitIdScheme: 'code',
          startDate: '20200731',
          endDate: '20200904',
          eventId: '123456',
          trackedEntityInstance: '654321',
        }),
      );
    });
  });

  describe('data pulling', () => {
    it('basic event data group', async () => {
      const dhisEvent = {
        event: 'eventId',
        eventDate: '2020-02-06T10:18:00.000',
        orgUnit: 'TO',
        orgUnitName: 'Tonga',
        dataValues: {
          POP01: 1,
          POP02: 2,
        },
      };
      const dhisApi = createMockDhisApi({ getEventsResponse: [dhisEvent] });

      const results = await deprecatedEventsPuller.pull(
        [dhisApi],
        [DATA_GROUPS.POP01_GROUP],
        basicOptions,
      );
      expect(results).toStrictEqual([dhisEvent]);
    });

    it('data values with different dhis codes', async () => {
      const dhisEvent = {
        event: 'eventId',
        eventDate: '2020-02-06T10:18:00.000',
        orgUnit: 'TO',
        orgUnitName: 'Tonga',
        dataValues: {
          POP01: 1,
          DIF01_DHIS: 3,
        },
      };
      const dhisApi = createMockDhisApi({ getEventsResponse: [dhisEvent] });

      const results = await deprecatedEventsPuller.pull(
        [dhisApi],
        [DATA_GROUPS.DIFF_GROUP],
        basicOptions,
      );
      expect(results).toStrictEqual([
        {
          ...dhisEvent,
          dataValues: {
            POP01: 1,
            DIF01: 3,
          },
        },
      ]);
    });
  });
});
