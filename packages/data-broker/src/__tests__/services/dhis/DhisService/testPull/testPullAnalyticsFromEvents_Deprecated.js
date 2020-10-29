/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DhisService } from '../../../../../services/dhis/DhisService';
import { DATA_SOURCES } from '../DhisService.fixtures';
import { createModelsStub, stubDhisApi } from '../DhisService.stubs';

const dhisService = new DhisService(createModelsStub());
let dhisApi;

export const testPullAnalyticsFromEvents_Deprecated = () => {
  const basicOptions = {
    programCodes: ['POP01'],
  };

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
      await dhisService.pull(dataSources, 'dataElement', options);
      expect(dhisApi.getEvents).toHaveBeenCalledOnceWith(invocationArgs);
    };

    it('invokes the DHIS api using a `programCodes` option', async () =>
      assertEventsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01],
        options: basicOptions,
        invocationArgs: expect.objectContaining({ programCodes: ['POP01'] }),
      }));

    it('forces `dataElementIdScheme` option to `code`', async () =>
      assertEventsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01],
        options: { ...basicOptions, dataElementIdScheme: 'id' },
        invocationArgs: expect.objectContaining({ dataElementIdScheme: 'code' }),
      }));

    it('`organisationUnitCodes` can be empty', async () => {
      const assertErrorIsNotThrown = async organisationUnitCodes =>
        expect(
          dhisService.pull([DATA_SOURCES.POP01], 'dataElement', { organisationUnitCodes }),
        ).toResolve();

      return Promise.all([undefined, []].map(assertErrorIsNotThrown));
    });

    it('uses the first provided organisation unit code', async () =>
      assertEventsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01],
        options: { ...basicOptions, organisationUnitCodes: ['TO', 'PG'] },
        invocationArgs: expect.objectContaining({ organisationUnitCode: 'TO' }),
      }));

    it('supports various API options', async () => {
      const options = {
        startDate: '20200731',
        endDate: '20200904',
        trackedEntityInstance: 'instance_dhisId',
      };

      return assertEventsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01],
        options: { ...basicOptions, ...options },
        invocationArgs: expect.objectContaining(options),
      });
    });
  });
};
