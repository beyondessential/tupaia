/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

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
      await dhisService.pull(dataSources, 'dataGroup', options);
      expect(dhisApi.getEvents).to.have.been.calledOnceWithExactly(invocationArgs);
    };

    it('uses the provided data source as `programCode` option', async () =>
      assertEventsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01_GROUP],
        invocationArgs: sinon.match({ programCode: 'POP01' }),
      }));

    it('forces `dataElementIdScheme` option to `code`', async () =>
      assertEventsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01_GROUP],
        options: { dataElementIdScheme: 'id' },
        invocationArgs: sinon.match({ dataElementIdScheme: 'code' }),
      }));

    it('`organisationUnitCodes` can be empty', async () => {
      const assertErrorIsNotThrown = async organisationUnitCodes =>
        expect(dhisService.pull([DATA_SOURCES.POP01_GROUP], 'dataGroup', { organisationUnitCodes }))
          .to.not.be.rejected;

      return Promise.all([undefined, []].map(assertErrorIsNotThrown));
    });

    it('uses the first provided organisation unit code', async () =>
      assertEventsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01_GROUP],
        options: { organisationUnitCodes: ['TO', 'PG'] },
        invocationArgs: sinon.match({ organisationUnitCode: 'TO' }),
      }));

    it('supports various API options', async () => {
      const options = {
        orgUnitIdScheme: 'code',
        startDate: '20200731',
        endDate: '20200904',
        eventId: '123456',
        trackedEntityInstance: '654321',
        dataValueFormat: 'object',
      };

      return assertEventsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01_GROUP],
        options,
        invocationArgs: sinon.match(options),
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
      return expect(dhisService.pull(dataSources, 'dataGroup', options)).to.eventually.deep.equal(
        expectedResults,
      );
    };

    it('basic event data group', async () => {
      const getEventsResponse = [
        {
          otherField: 'otherValue',
          dataValues: [
            { dataElement: 'POP01', value: 1 },
            { dataElement: 'POP02', value: 2 },
          ],
        },
      ];

      return assertPullResultsAreCorrect({
        dataSources: [DATA_SOURCES.POP01_GROUP],
        getEventsResponse,
        expectedResults: getEventsResponse,
      });
    });

    it('array data values with different dhis codes', async () => {
      const getEventsResponse = [
        {
          otherField: 'otherValue',
          dataValues: [
            { dataElement: 'POP01', value: 1 },
            { dataElement: 'DIF01_DHIS', value: 3 },
          ],
        },
      ];

      return assertPullResultsAreCorrect({
        dataSources: [DATA_SOURCES.DIFF_GROUP],
        options: { dataValueFormat: 'array' },
        getEventsResponse,
        expectedResults: [
          {
            otherField: 'otherValue',
            dataValues: [
              { dataElement: 'POP01', value: 1 },
              { dataElement: 'DIF01', value: 3 },
            ],
          },
        ],
      });
    });

    it('object data values with different dhis codes', async () => {
      const getEventsResponse = [
        {
          otherField: 'otherValue',
          dataValues: {
            POP01: { dataElement: 'POP01', value: 1 },
            DIF01_DHIS: { dataElement: 'DIF01_DHIS', value: 3 },
          },
        },
      ];

      return assertPullResultsAreCorrect({
        dataSources: [DATA_SOURCES.DIFF_GROUP],
        options: { dataValueFormat: 'object' },
        getEventsResponse,
        expectedResults: [
          {
            otherField: 'otherValue',
            dataValues: {
              POP01: { dataElement: 'POP01', value: 1 },
              DIF01: { dataElement: 'DIF01', value: 3 },
            },
          },
        ],
      });
    });
  });
};
