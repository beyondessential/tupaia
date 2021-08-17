/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DhisService } from '../../../../../services/dhis/DhisService';
import { DATA_SOURCES } from '../DhisService.fixtures';
import { createModelsStub, stubDhisApi } from '../DhisService.stubs';

const dhisService = new DhisService(createModelsStub());
let dhisApi;

export const testPullEvents_Deprecated = () => {
  beforeEach(() => {
    // recreate stub so spy calls are reset
    dhisApi = stubDhisApi();
  });

  describe('DHIS API invocation', () => {
    const assertEventsApiWasInvokedCorrectly = async ({
      dataSources,
      options = {},
      invocationArgs,
    }) => {
      await dhisService.pull(dataSources, 'dataGroup', { useDeprecatedApi: true, ...options });
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
          dhisService.pull([DATA_SOURCES.POP01_GROUP], 'dataGroup', { organisationUnitCodes }),
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
      dhisApi = stubDhisApi({ getEventsResponse });
      return expect(
        dhisService.pull(dataSources, 'dataGroup', { useDeprecatedApi: true, ...options }),
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
};
