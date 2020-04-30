/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { DhisService } from '../../../../../services/dhis/DhisService';
import { DATA_SOURCES } from '../DhisService.fixtures';
import { buildDhisAnalyticsResponse, stubModels, stubDhisApi } from '../helpers';
import { testPullAnalyticsFromEvents_Deprecated } from './testPullAnalyticsFromEvents_Deprecated';

const dhisService = new DhisService(stubModels());
let dhisApi;

export const testPullAnalytics = () => {
  beforeEach(() => {
    // recreate stub so spy calls are reset
    dhisApi = stubDhisApi();
  });

  describe('data source selection', () => {
    const analyticsSpy = sinon.spy(dhisService, 'pullAnalyticsForApi');
    const analyticsFromEventsSpy = sinon.spy(dhisService, 'pullAnalyticsFromEventsForApi');
    const analyticsFromEvents_DeprecatedSpy = sinon.spy(
      dhisService,
      'pullAnalyticsFromEventsForApi_Deprecated',
    );

    beforeEach(() => {
      analyticsSpy.resetHistory();
      analyticsFromEventsSpy.resetHistory();
      analyticsFromEvents_DeprecatedSpy.resetHistory();
    });

    it('pulls aggregate data by default', async () => {
      await dhisService.pull([DATA_SOURCES.POP01_GROUP], 'dataElement', {});
      expect(analyticsSpy).to.have.callCount(1);
      expect(analyticsFromEventsSpy).to.have.callCount(0);
      expect(analyticsFromEvents_DeprecatedSpy).to.have.callCount(0);
    });

    it('pulls event data if `programCodes` are provided', async () => {
      await dhisService.pull([DATA_SOURCES.POP01_GROUP], 'dataElement', {
        programCodes: ['POP01'],
      });
      expect(analyticsSpy).to.have.callCount(0);
      expect(
        analyticsFromEventsSpy.callCount + analyticsFromEvents_DeprecatedSpy.callCount,
      ).to.equal(1);
    });

    it('invokes the deprecated analytics from events api by default', async () => {
      await dhisService.pull([DATA_SOURCES.POP01_GROUP], 'dataElement', {
        programCodes: ['POP01'],
      });
      expect(analyticsFromEventsSpy).to.have.callCount(0);
      expect(analyticsFromEvents_DeprecatedSpy).to.have.callCount(1);
    });
  });

  describe('from aggregate data', () => {
    describe('DHIS API invocation', () => {
      const assertAnalyticsApiWasInvokedCorrectly = async ({
        dataSources,
        options = {},
        invocationArgs,
      }) => {
        await dhisService.pull(dataSources, 'dataElement', options);
        expect(dhisApi.getAnalytics).to.have.been.calledOnceWithExactly(invocationArgs);
      };

      it('single data element', async () =>
        assertAnalyticsApiWasInvokedCorrectly({
          dataSources: [DATA_SOURCES.POP01],
          invocationArgs: sinon.match({ dataElementCodes: ['POP01'] }),
        }));

      it('single data element with different DHIS code', async () =>
        assertAnalyticsApiWasInvokedCorrectly({
          dataSources: [DATA_SOURCES.DIF01],
          invocationArgs: sinon.match({ dataElementCodes: ['DIF01_DHIS'] }),
        }));

      it('multiple data elements', async () =>
        assertAnalyticsApiWasInvokedCorrectly({
          dataSources: [DATA_SOURCES.POP01, DATA_SOURCES.POP02],
          invocationArgs: sinon.match({ dataElementCodes: ['POP01', 'POP02'] }),
        }));

      it('supports various API options', async () => {
        const options = {
          outputIdScheme: 'code',
          organisationUnitCodes: ['TO', 'PG'],
          period: '20200822',
          startDate: '20200731',
          endDate: '20200904',
        };

        return assertAnalyticsApiWasInvokedCorrectly({
          dataSources: [DATA_SOURCES.POP01],
          options: options,
          invocationArgs: {
            dataElementCodes: ['POP01'],
            ...options,
          },
        });
      });
    });

    describe('data pulling', () => {
      const basicOptions = {
        organisationUnitCodes: ['TO'],
      };

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

  describe('from event data', () => {});

  describe('from event data - deprecated API', testPullAnalyticsFromEvents_Deprecated);
};
