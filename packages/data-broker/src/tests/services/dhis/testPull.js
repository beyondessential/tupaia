/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { DhisService } from '../../../services/dhis/DhisService';
import { DATA_ELEMENT_CODE_TO_ID, DATA_SOURCES } from './DhisService.fixtures';
import { stubModels, stubDhisApi } from './helpers';

const dhisService = new DhisService(stubModels());
let dhisApi;

const basicOptions = {
  dataServices: [{ isDataRegional: true }],
  organisationUnitCode: 'TO',
};
const basicMetadata = { dataElementCodeToName: {} };

export const testPull = () => {
  beforeEach(() => {
    // recreate stub so spy calls are reset
    dhisApi = stubDhisApi();
  });

  describe('data element', () => {
    const assertAnalyticsApiWasInvokedCorrectly = async ({
      dataSources,
      options,
      invocationArgs,
    }) => {
      await dhisService.pull(dataSources, 'dataElement', options);
      expect(dhisApi.getAnalytics).to.have.been.calledOnceWithExactly(invocationArgs);
    };

    const assertPullResultsAreCorrect = ({
      dataSources,
      options,
      getAnalyticsResponse,
      expectedResults,
    }) => {
      dhisApi = stubDhisApi({ getAnalyticsResponse });
      return expect(dhisService.pull(dataSources, 'dataElement', options)).to.eventually.deep.equal(
        expectedResults,
      );
    };

    it('invokes the events api in DHIS for a single data group', async () =>
      assertAnalyticsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01],
        options: basicOptions,
        invocationArgs: sinon.match({ dataElementCodes: ['POP01'], organisationUnitCode: 'TO' }),
      }));

    it('invokes the events api in DHIS for multiple data groups', async () =>
      assertAnalyticsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01, DATA_SOURCES.POP02],
        options: basicOptions,
        invocationArgs: sinon.match({
          dataElementCodes: ['POP01', 'POP02'],
          organisationUnitCode: 'TO',
        }),
      }));

    it('pulls a single aggregate data element', async () => {
      const getAnalyticsResponse = {
        results: [{ dataElement: 'POP01', value: 1 }],
        metadata: basicMetadata,
      };

      return assertPullResultsAreCorrect({
        dataSources: [DATA_SOURCES.POP01],
        options: basicOptions,
        getAnalyticsResponse,
        expectedResults: getAnalyticsResponse,
      });
    });

    it('pulls multiple aggregate data elements', async () => {
      const getAnalyticsResponse = {
        results: [
          { dataElement: 'POP01', value: 1 },
          { dataElement: 'POP02', value: 2 },
        ],
        metadata: basicMetadata,
      };

      return assertPullResultsAreCorrect({
        dataSources: [DATA_SOURCES.POP01, DATA_SOURCES.POP02],
        options: basicOptions,
        getAnalyticsResponse,
        expectedResults: getAnalyticsResponse,
      });
    });

    it('pulls an aggregate data element with a different dhis code', async () => {
      const getAnalyticsResponse = {
        results: [{ dataElement: 'DIF01_DHIS', value: 3 }],
        metadata: {
          dataElementCodeToName: { DIF01_DHIS: 'DIF01 Element' },
        },
      };
      dhisApi = stubDhisApi({ getAnalyticsResponse });

      const response = await dhisService.pull([DATA_SOURCES.DIF01], 'dataElement', basicOptions);
      expect(dhisApi.getAnalytics).to.have.been.calledOnceWithExactly(
        sinon.match({
          dataElementCodes: ['DIF01_DHIS'],
          organisationUnitCode: 'TO',
        }),
      );
      return expect(response).to.deep.equal({
        results: [{ dataElement: 'DIF01', value: 3 }],
        metadata: {
          dataElementCodeToName: { DIF01: 'DIF01 Element' },
        },
      });
    });

    it('supports various API options', async () => {
      const apiOptions = {
        outputIdScheme: 'code',
        organisationUnitCode: 'TO',
        period: '20200822',
        startDate: '20200731',
        endDate: '20200904',
      };

      return assertAnalyticsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01],
        options: {
          dataServices: [{ isDataRegional: true }],
          ...apiOptions,
        },
        invocationArgs: {
          dataElementCodes: ['POP01'],
          ...apiOptions,
        },
      });
    });
  });

  describe('data group', () => {
    const assertEventsApiWasInvokedCorrectly = async ({ dataSources, options, invocationArgs }) => {
      await dhisService.pull(dataSources, 'dataGroup', options);
      expect(dhisApi.getEvents).to.have.been.calledOnceWithExactly(invocationArgs);
    };

    const assertPullResultsAreCorrect = ({
      dataSources,
      options,
      expectedResults,
      getEventsResponse,
    }) => {
      dhisApi = stubDhisApi({ getEventsResponse });
      return expect(dhisService.pull(dataSources, 'dataGroup', options)).to.eventually.deep.equal(
        expectedResults,
      );
    };

    it('invokes the events api in DHIS for a single data group', async () =>
      assertEventsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01_GROUP],
        options: basicOptions,
        invocationArgs: sinon.match({ programCode: 'POP01', organisationUnitCode: 'TO' }),
      }));

    it('throws an error if multiple data groups are provided', async () =>
      expect(
        dhisService.pull(
          [DATA_SOURCES.POP01_GROUP, DATA_SOURCES.POP02_GROUP],
          'dataGroup',
          basicOptions,
        ),
      ).to.eventually.be.rejectedWith(/Cannot .*multiple programs/));

    it('pulls a basic event data group', async () => {
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
        options: basicOptions,
        getEventsResponse,
        expectedResults: getEventsResponse,
      });
    });

    describe('pulls an event including array data values with different dhis codes', () => {
      it('array data values', async () => {
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
          options: { ...basicOptions, dataValueFormat: 'array' },
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

      it('object data values', async () => {
        const getEventsResponse = [
          {
            otherField: 'otherValue',
            dataValues: { POP01: 1, DIF01_DHIS: 3 },
          },
        ];

        return assertPullResultsAreCorrect({
          dataSources: [DATA_SOURCES.DIFF_GROUP],
          options: { ...basicOptions, dataValueFormat: 'object' },
          getEventsResponse,
          expectedResults: [
            {
              otherField: 'otherValue',
              dataValues: { POP01: 1, DIF01: 3 },
            },
          ],
        });
      });
    });

    it('supports various API options', async () => {
      const apiOptions = {
        organisationUnitCode: 'TO',
        orgUnitIdScheme: 'code',
        dataElementIdScheme: 'code',
        startDate: '20200731',
        endDate: '20200904',
        eventId: '123456',
        trackedEntityInstance: '654321',
        dataValueFormat: 'object',
      };

      assertEventsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01_GROUP],
        options: {
          dataServices: [{ isDataRegional: true }],
          ...apiOptions,
        },
        invocationArgs: {
          programCode: 'POP01',
          ...apiOptions,
        },
      });
    });
  });
};
