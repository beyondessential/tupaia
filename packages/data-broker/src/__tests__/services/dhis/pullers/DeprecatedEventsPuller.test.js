/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createMockDhisApi, createModelsStub, stubGetDhisApi } from '../DhisService.stubs';
import { DATA_SOURCES } from '../DhisService.fixtures';
import { DeprecatedEventsPuller } from '../../../../services/dhis/pullers';
import { DhisTranslator } from '../../../../services/dhis/DhisTranslator';

describe('DeprecatedEventsPuller', () => {
  let deprecatedEventsPuller;
  let dhisApi;

  beforeEach(() => {
    const models = createModelsStub();
    const translator = new DhisTranslator(models);
    deprecatedEventsPuller = new DeprecatedEventsPuller(models.dataSource, translator);
    dhisApi = createMockDhisApi();
    stubGetDhisApi(dhisApi);
  });

  it('throws an error if multiple data groups are provided', async () =>
    expect(
      deprecatedEventsPuller.pull(
        [dhisApi],
        [DATA_SOURCES.POP01_GROUP, DATA_SOURCES.DIFF_GROUP],
        {},
      ),
    ).toBeRejectedWith(/Cannot .*multiple programs/));

  describe('DHIS API invocation', () => {
    const assertEventsApiWasInvokedCorrectly = async ({
      dataSources,
      options = {},
      invocationArgs,
    }) => {
      await deprecatedEventsPuller.pull([dhisApi], dataSources, options);
      expect(dhisApi.getEvents).toHaveBeenCalledOnceWith(invocationArgs);
    };

    it('uses the provided data source as `programCode` option', async () =>
      assertEventsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01_GROUP],
        invocationArgs: expect.objectContaining({ programCode: 'POP01' }),
      }));

    it('forces `dataElementIdScheme` option to `code`', async () =>
      assertEventsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01_GROUP],
        options: { dataElementIdScheme: 'id' },
        invocationArgs: expect.objectContaining({ dataElementIdScheme: 'code' }),
      }));

    it('forces `dataValueFormat` option to `object`', async () =>
      assertEventsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01_GROUP],
        options: { dataValueFormat: 'array' },
        invocationArgs: expect.objectContaining({ dataValueFormat: 'object' }),
      }));

    it('`organisationUnitCodes` can be empty', async () => {
      const assertErrorIsNotThrown = async organisationUnitCodes =>
        expect(
          deprecatedEventsPuller.pull([dhisApi], [DATA_SOURCES.POP01_GROUP], {
            organisationUnitCodes,
          }),
        ).toResolve();

      return Promise.all([undefined, []].map(assertErrorIsNotThrown));
    });

    it('uses the first provided organisation unit code', async () =>
      assertEventsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01_GROUP],
        options: { organisationUnitCodes: ['TO', 'PG'] },
        invocationArgs: expect.objectContaining({ organisationUnitCode: 'TO' }),
      }));

    it('supports various API options', async () => {
      const options = {
        orgUnitIdScheme: 'code',
        startDate: '20200731',
        endDate: '20200904',
        eventId: '123456',
        trackedEntityInstance: '654321',
      };

      return assertEventsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01_GROUP],
        options,
        invocationArgs: expect.objectContaining(options),
      });
    });
  });

  describe('data pulling', () => {
    const assertPullResultsAreCorrect = ({
      dataSources,
      options = {},
      expectedResults,
      getEventsResponse,
    }) => {
      dhisApi = createMockDhisApi({ getEventsResponse });
      stubGetDhisApi(dhisApi);
      return expect(
        deprecatedEventsPuller.pull([dhisApi], dataSources, options),
      ).resolves.toStrictEqual(expectedResults);
    };

    it('basic event data group', async () => {
      const getEventsResponse = [
        {
          otherField: 'otherValue',
          dataValues: {
            POP01: 1,
            POP02: 2,
          },
        },
      ];

      return assertPullResultsAreCorrect({
        dataSources: [DATA_SOURCES.POP01_GROUP],
        getEventsResponse,
        expectedResults: getEventsResponse,
      });
    });

    it('data values with different dhis codes', async () => {
      const getEventsResponse = [
        {
          otherField: 'otherValue',
          dataValues: {
            POP01: 1,
            DIF01_DHIS: 3,
          },
        },
      ];

      return assertPullResultsAreCorrect({
        dataSources: [DATA_SOURCES.DIFF_GROUP],
        getEventsResponse,
        expectedResults: [
          {
            otherField: 'otherValue',
            dataValues: {
              POP01: 1,
              DIF01: 3,
            },
          },
        ],
      });
    });
  });
});
