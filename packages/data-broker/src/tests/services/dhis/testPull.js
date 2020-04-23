/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { DhisService } from '../../../services/dhis/DhisService';
import { DATA_SOURCES } from './DhisService.fixtures';
import { buildDhisAnalyticsResponse, stubModels, stubDhisApi } from './helpers';

const dhisService = new DhisService(stubModels());
let dhisApi;

export const testPull = () => {
  beforeEach(() => {
    // recreate stub so spy calls are reset
    dhisApi = stubDhisApi();
  });

  describe('data element', () => {
    const basicOptions = {
      organisationUnitCodes: ['TO'],
    };
    describe('DHIS API invocation', () => {
      const assertAnalyticsApiWasInvokedCorrectly = async ({
        dataSources,
        options,
        invocationArgs,
      }) => {
        await dhisService.pull(dataSources, 'dataElement', options);
        expect(dhisApi.getAnalytics).to.have.been.calledOnceWithExactly(invocationArgs);
      };

      it('single data element', async () =>
        assertAnalyticsApiWasInvokedCorrectly({
          dataSources: [DATA_SOURCES.POP01],
          options: basicOptions,
          invocationArgs: sinon.match({
            dataElementCodes: ['POP01'],
            organisationUnitCodes: ['TO'],
          }),
        }));

      it('single data element with different DHIS code', async () =>
        assertAnalyticsApiWasInvokedCorrectly({
          dataSources: [DATA_SOURCES.DIF01],
          options: basicOptions,
          invocationArgs: sinon.match({
            dataElementCodes: ['DIF01_DHIS'],
            organisationUnitCodes: ['TO'],
          }),
        }));

      it('multiple data elements', async () =>
        assertAnalyticsApiWasInvokedCorrectly({
          dataSources: [DATA_SOURCES.POP01, DATA_SOURCES.POP02],
          options: basicOptions,
          invocationArgs: sinon.match({
            dataElementCodes: ['POP01', 'POP02'],
            organisationUnitCodes: ['TO'],
          }),
        }));

      it('supports various API options', async () => {
        const apiOptions = {
          outputIdScheme: 'code',
          organisationUnitCodes: ['TO'],
          period: '20200822',
          startDate: '20200731',
          endDate: '20200904',
        };

        return assertAnalyticsApiWasInvokedCorrectly({
          dataSources: [DATA_SOURCES.POP01],
          options: apiOptions,
          invocationArgs: {
            dataElementCodes: ['POP01'],
            ...apiOptions,
          },
        });
      });
    });

    describe('data pulling', () => {
      const assertPullResultsAreCorrect = ({ dataSources, options, expectedResults }) => {
        dhisApi = stubDhisApi({
          getAnalyticsResponse: buildDhisAnalyticsResponse(expectedResults.results),
        });
        return expect(
          dhisService.pull(dataSources, 'dataElement', options),
        ).to.eventually.deep.equal(expectedResults);
      };

      it('single data element', async () => {
        const results = [
          { dataElement: 'POP01', organisationUnit: 'TO', value: 1, period: '20200101' },
        ];

        return assertPullResultsAreCorrect({
          dataSources: [DATA_SOURCES.POP01],
          options: basicOptions,
          expectedResults: {
            results,
            metadata: { dataElementCodeToName: { POP01: 'Population 1' } },
          },
        });
      });

      it('single data element with a different DHIS code', async () => {
        const results = [
          { dataElement: 'DIF01', organisationUnit: 'TO', value: 3, period: '20200103' },
        ];

        return assertPullResultsAreCorrect({
          dataSources: [DATA_SOURCES.DIF01],
          options: basicOptions,
          expectedResults: {
            results,
            metadata: {
              dataElementCodeToName: { DIF01: 'Different 1' },
            },
          },
        });
      });

      it('multiple data elements', async () => {
        const results = [
          { dataElement: 'POP01', organisationUnit: 'TO', value: 1, period: '20200101' },
          { dataElement: 'POP02', organisationUnit: 'TO', value: 2, period: '20200102' },
        ];

        return assertPullResultsAreCorrect({
          dataSources: [DATA_SOURCES.POP01, DATA_SOURCES.POP02],
          options: basicOptions,
          expectedResults: {
            results,
            metadata: {
              dataElementCodeToName: { POP01: 'Population 1', POP02: 'Population 2' },
            },
          },
        });
      });
    });
  });

  describe('data group', () => {
    const basicOptions = {
      organisationUnitCode: 'TO',
    };

    it('throws an error if multiple data groups are provided', async () =>
      expect(
        dhisService.pull(
          [DATA_SOURCES.POP01_GROUP, DATA_SOURCES.POP02_GROUP],
          'dataGroup',
          basicOptions,
        ),
      ).to.eventually.be.rejectedWith(/Cannot .*multiple programs/));

    describe('DHIS API invocation', () => {
      const assertEventsApiWasInvokedCorrectly = async ({
        dataSources,
        options,
        invocationArgs,
      }) => {
        await dhisService.pull(dataSources, 'dataGroup', options);
        expect(dhisApi.getEvents).to.have.been.calledOnceWithExactly(invocationArgs);
      };

      it('invokes the events api in DHIS for a single data group', async () =>
        assertEventsApiWasInvokedCorrectly({
          dataSources: [DATA_SOURCES.POP01_GROUP],
          options: basicOptions,
          invocationArgs: sinon.match({ programCode: 'POP01', organisationUnitCode: 'TO' }),
        }));

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
          options: apiOptions,
          invocationArgs: {
            programCode: 'POP01',
            ...apiOptions,
          },
        });
      });
    });

    describe('data pulling', () => {
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
          options: basicOptions,
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
          options: { ...basicOptions, dataValueFormat: 'object' },
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
  });
};
