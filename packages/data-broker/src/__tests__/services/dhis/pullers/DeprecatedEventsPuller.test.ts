/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DhisApi } from '@tupaia/dhis-api';
import { createModelsStub, stubDhisApi } from '../DhisService.stubs';
import { DATA_GROUPS } from '../DhisService.fixtures';
import { DeprecatedEventsPuller, PullEventsOptions } from '../../../../services/dhis/pullers';
import { DhisTranslator } from '../../../../services/dhis/DhisTranslator';

describe('DeprecatedEventsPuller', () => {
  const basicOptions = {
    organisationUnitCodes: ['TO'],
    dataServices: [{ isDataRegional: true }],
  };

  let deprecatedEventsPuller: DeprecatedEventsPuller;
  let dhisApi: DhisApi;

  beforeEach(() => {
    const models = createModelsStub();
    const translator = new DhisTranslator(models);
    deprecatedEventsPuller = new DeprecatedEventsPuller(models.dataElement, translator);
    dhisApi = stubDhisApi();
  });

  it('throws an error if multiple data groups are provided', async () =>
    expect(
      deprecatedEventsPuller.pull(
        [dhisApi],
        [DATA_GROUPS.POP01_GROUP, DATA_GROUPS.DIFF_GROUP],
        basicOptions,
      ),
    ).toBeRejectedWith(/Cannot .*multiple programs/));

  describe('DHIS API invocation', () => {
    it('uses the provided data source as `programCode` option', async () => {
      await deprecatedEventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], basicOptions);
      expect(dhisApi.getEvents).toHaveBeenCalledOnceWith(
        expect.objectContaining({ programCode: 'POP01' }),
      );
    });

    it('forces `dataElementIdScheme` option to `code`', async () => {
      await deprecatedEventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
        ...basicOptions,
        dataElementIdScheme: 'id',
      } as PullEventsOptions);
      expect(dhisApi.getEvents).toHaveBeenCalledOnceWith(
        expect.objectContaining({ dataElementIdScheme: 'code' }),
      );
    });

    it('forces `dataValueFormat` option to `object`', async () => {
      await deprecatedEventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
        ...basicOptions,
        dataValueFormat: 'array',
      } as PullEventsOptions);
      expect(dhisApi.getEvents).toHaveBeenCalledOnceWith(
        expect.objectContaining({ dataValueFormat: 'object' }),
      );
    });

    it('`organisationUnitCodes` can be empty', async () => {
      const assertErrorIsNotThrown = async (organisationUnitCodes?: string[]) =>
        expect(
          deprecatedEventsPuller.pull([dhisApi], [DATA_GROUPS.POP01_GROUP], {
            organisationUnitCodes,
          } as PullEventsOptions),
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
      const options = {
        dataServices: [{ isDataRegional: true }],
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
          // dataServices: [{ isDataRegional: true }], this field is excluded
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
      dhisApi = stubDhisApi({ getEventsResponse: [dhisEvent] });

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
      dhisApi = stubDhisApi({ getEventsResponse: [dhisEvent] });

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
