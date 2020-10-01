/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import * as BuildAnalyticsFromEventAnalytics from '../../../../../services/dhis/buildAnalytics/buildAnalyticsFromDhisEventAnalytics';
import { DhisService } from '../../../../../services/dhis/DhisService';
import { DATA_SOURCES, EVENT_ANALYTICS } from '../DhisService.fixtures';
import { buildDhisAnalyticsResponse, createModelsStub, stubDhisApi } from '../DhisService.stubs';
import { testPullAnalyticsFromEvents_Deprecated } from './testPullAnalyticsFromEvents_Deprecated';

const dhisService = new DhisService(createModelsStub());
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
      await dhisService.pull([DATA_SOURCES.POP01], 'dataElement', {});
      expect(analyticsSpy).to.have.callCount(1);
      expect(analyticsFromEventsSpy).to.have.callCount(0);
      expect(analyticsFromEvents_DeprecatedSpy).to.have.callCount(0);
    });

    it('pulls event data if `programCodes` are provided', async () => {
      await dhisService.pull([DATA_SOURCES.POP01], 'dataElement', {
        programCodes: ['POP01'],
      });
      expect(analyticsSpy).to.have.callCount(0);
      expect(
        analyticsFromEventsSpy.callCount + analyticsFromEvents_DeprecatedSpy.callCount,
      ).to.equal(1);
    });

    it('invokes the deprecated analytics from events api by default', async () => {
      await dhisService.pull([DATA_SOURCES.POP01], 'dataElement', {
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
          options,
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

  describe('from event data', () => {
    const basicOptions = {
      programCodes: ['POP01'],
      useDeprecatedApi: false,
    };

    let buildAnalyticsStub;

    before(() => {
      buildAnalyticsStub = sinon.stub(
        BuildAnalyticsFromEventAnalytics,
        'buildAnalyticsFromDhisEventAnalytics',
      );
    });

    beforeEach(() => {
      buildAnalyticsStub.returns({ results: [], metadata: { dataElementCodeToName: {} } });
      buildAnalyticsStub.resetHistory();
    });

    after(() => {
      buildAnalyticsStub.restore();
    });

    describe('DHIS API invocation', () => {
      const assertEventAnalyticsApiWasInvokedOnceWith = async ({
        dataSources,
        options = {},
        invocationArgs,
      }) => {
        await dhisService.pull(dataSources, 'dataElement', {
          ...options,
          useDeprecatedApi: false,
        });
        expect(dhisApi.getEventAnalytics).to.have.been.calledOnceWithExactly(invocationArgs);
      };

      it('no program', async () => {
        await dhisService.pull([DATA_SOURCES.POP01, DATA_SOURCES.POP02], 'dataElement', {
          useDeprecatedApi: false,
        });
        expect(dhisApi.getEventAnalytics).to.have.not.been.called;
      });

      it('single program', async () => {
        await dhisService.pull([DATA_SOURCES.POP01, DATA_SOURCES.POP02], 'dataElement', {
          programCodes: ['POP01'],
          useDeprecatedApi: false,
        });
        expect(dhisApi.getEventAnalytics).to.have.been.calledWithExactly(
          sinon.match({ programCode: 'POP01' }),
        );
      });

      it('multiple programs', async () => {
        await dhisService.pull([DATA_SOURCES.POP01, DATA_SOURCES.POP02], 'dataElement', {
          programCodes: ['POP01', 'DIFF_GROUP'],
          useDeprecatedApi: false,
        });
        expect(dhisApi.getEventAnalytics).to.have.been.calledWithExactly(
          sinon.match({
            programCode: 'POP01',
          }),
        );
        expect(dhisApi.getEventAnalytics).to.have.been.calledWithExactly(
          sinon.match({
            programCode: 'DIFF_GROUP',
          }),
        );
        expect(dhisApi.getEventAnalytics).to.have.callCount(2);
      });

      it('simple data elements', () =>
        assertEventAnalyticsApiWasInvokedOnceWith({
          dataSources: [DATA_SOURCES.POP01, DATA_SOURCES.POP02],
          options: basicOptions,
          invocationArgs: sinon.match({
            dataElementCodes: ['POP01', 'POP02'],
          }),
        }));

      it('data elements with data source codes different than DHIS2 codes', () =>
        assertEventAnalyticsApiWasInvokedOnceWith({
          dataSources: [DATA_SOURCES.POP01, DATA_SOURCES.DIF01],
          options: basicOptions,
          invocationArgs: sinon.match({
            dataElementCodes: ['POP01', 'DIF01_DHIS'],
          }),
        }));

      it('forces `dataElementIdScheme` option to `code`', async () =>
        assertEventAnalyticsApiWasInvokedOnceWith({
          dataSources: [DATA_SOURCES.POP01],
          options: { ...basicOptions, dataElementIdScheme: 'id' },
          invocationArgs: sinon.match({ dataElementIdScheme: 'code' }),
        }));

      it('supports various API options', async () => {
        const options = {
          period: '20200427',
          startDate: '20200731',
          endDate: '20200904',
        };

        return assertEventAnalyticsApiWasInvokedOnceWith({
          dataSources: [DATA_SOURCES.POP01],
          options: { ...basicOptions, ...options },
          invocationArgs: sinon.match(options),
        });
      });
    });

    describe('data building', () => {
      describe('buildAnalyticsFromDhisEventAnalytics() invocation', () => {
        it('no program', async () => {
          const emptyEventAnalytics = {
            headers: [],
            metaData: { items: {}, dimensions: {} },
            width: 0,
            height: 0,
            rows: [],
          };
          const dataElementCodes = ['POP01'];

          await dhisService.pull([DATA_SOURCES.POP01], 'dataElement', {
            useDeprecatedApi: false,
            programCodes: [],
          });
          expect(
            BuildAnalyticsFromEventAnalytics.buildAnalyticsFromDhisEventAnalytics,
          ).to.have.been.calledOnceWithExactly(sinon.match(emptyEventAnalytics), dataElementCodes);
        });

        it('simple data elements', async () => {
          const getEventAnalyticsResponse = EVENT_ANALYTICS.sameDhisElementCodes;
          dhisApi = stubDhisApi({ getEventAnalyticsResponse });
          const dataElementCodes = ['POP01', 'POP02'];

          await dhisService.pull([DATA_SOURCES.POP01, DATA_SOURCES.POP02], 'dataElement', {
            ...basicOptions,
            dataElementCodes,
          });
          expect(
            BuildAnalyticsFromEventAnalytics.buildAnalyticsFromDhisEventAnalytics,
          ).to.have.been.calledOnceWithExactly(getEventAnalyticsResponse, dataElementCodes);
        });

        it('data elements with data source codes different than DHIS2 codes', async () => {
          const getEventAnalyticsResponse = EVENT_ANALYTICS.differentDhisElementCodes;
          const translatedEventAnalytics = {
            headers: [
              { name: 'oucode', column: 'Organisation unit code', valueType: 'TEXT' },
              { name: 'DIF01', column: 'Different 1', valueType: 'NUMBER' },
            ],
            metaData: {
              items: {
                ou: { name: 'Organisation unit' },
                DIF01: { name: 'Different 1' },
              },
              dimensions: {
                ou: ['tonga_dhisId'],
                DIF01: [],
              },
            },
            width: 2,
            height: 1,
            rows: [['TO_Nukuhc', '25.0']],
          };
          dhisApi = stubDhisApi({ getEventAnalyticsResponse });

          const dataElementCodes = ['DIF01'];
          await dhisService.pull([DATA_SOURCES.DIF01], 'dataElement', {
            ...basicOptions,
            dataElementCodes,
          });
          expect(
            BuildAnalyticsFromEventAnalytics.buildAnalyticsFromDhisEventAnalytics,
          ).to.have.been.calledOnceWith(translatedEventAnalytics, dataElementCodes);
        });
      });

      it('directly returns the buildAnalyticsFromDhisEventAnalytics() results', () => {
        const analyticsResponse = {
          results: [
            { period: '20200206', organisationUnit: 'TO_Nukuhc', dataElement: 'POP01', value: 1 },
          ],
          metadata: { dataElementCodeToName: { POP01: 'Population 1' } },
        };
        buildAnalyticsStub.returns(analyticsResponse);

        return expect(
          dhisService.pull([DATA_SOURCES.POP01], 'dataElement', basicOptions),
        ).to.eventually.deep.equal(analyticsResponse);
      });
    });
  });

  describe('from event data - deprecated API', testPullAnalyticsFromEvents_Deprecated);
};
