/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import * as BuildEvents from '../../../../services/dhis/buildAnalytics/buildEventsFromDhisEventAnalytics';
import { DhisService } from '../../../../services/dhis/DhisService';
import { DATA_SOURCES } from './DhisService.fixtures';
import { buildDhisAnalyticsResponse, stubModels, stubDhisApi } from './helpers';
import { testPullEvents_Deprecated } from './testPullEvents_Deprecated';

const dhisService = new DhisService(stubModels());
let dhisApi;

export const testPull = () => {
  beforeEach(() => {
    // recreate stub so spy calls are reset
    dhisApi = stubDhisApi();
  });

  describe('data element', () => {
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
          organisationUnitCodes: ['TO'],
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

  describe('data group', () => {
    it('throws an error if multiple data groups are provided', async () =>
      expect(
        dhisService.pull([DATA_SOURCES.POP01_GROUP, DATA_SOURCES.POP02_GROUP], 'dataGroup', {}),
      ).to.be.rejectedWith(/Cannot .*multiple programs/));

    it('invokes the deprecated event api by default', async () => {
      const eventApiSpy = sinon.spy(dhisService, 'pullEventsForApi');
      const deprecatedEventApiSpy = sinon.spy(dhisService, 'pullEventsForApi_Deprecated');

      await dhisService.pull([DATA_SOURCES.POP01_GROUP], 'dataGroup', {});
      expect(eventApiSpy).to.have.callCount(0);
      expect(deprecatedEventApiSpy).to.have.callCount(1);
    });

    describe('DHIS API invocation', () => {
      const assertEventAnalyticsApiWasInvokedCorrectly = async ({
        dataSources,
        options = {},
        invocationArgs,
      }) => {
        await dhisService.pull(dataSources, 'dataGroup', {
          ...options,
          useDeprecatedApi: false,
        });
        expect(dhisApi.getEventAnalytics).to.have.been.calledOnceWithExactly(invocationArgs);
      };

      it('correctly invokes the event analytics api in DHIS', () =>
        assertEventAnalyticsApiWasInvokedCorrectly({
          dataSources: [DATA_SOURCES.POP01_GROUP],
          invocationArgs: sinon.match({ programCode: 'POP01' }),
        }));

      it('forces `dataElementIdScheme` option to `code`', async () =>
        assertEventAnalyticsApiWasInvokedCorrectly({
          dataSources: [DATA_SOURCES.POP01_GROUP],
          options: { dataElementIdScheme: 'id' },
          invocationArgs: sinon.match({ dataElementIdScheme: 'code' }),
        }));

      it('`dataElementCodes` can be empty', async () => {
        const assertErrorIsNotThrown = async dataElementCodes =>
          expect(
            dhisService.pull([DATA_SOURCES.POP01_GROUP], 'dataGroup', {
              dataElementCodes,
              useDeprecatedApi: false,
            }),
          ).to.not.be.rejected;

        return Promise.all([undefined, []].map(assertErrorIsNotThrown));
      });

      it('supports various API options', async () => {
        const options = {
          dataElementCodes: ['POP01', 'POP02'],
          period: '20200427',
          startDate: '20200731',
          endDate: '20200904',
        };

        return assertEventAnalyticsApiWasInvokedCorrectly({
          dataSources: [DATA_SOURCES.POP01_GROUP],
          options,
          invocationArgs: sinon.match(options),
        });
      });
    });

    describe('data building', () => {
      const basicOptions = {
        useDeprecatedApi: false,
      };
      let buildEventsStub;

      before(() => {
        buildEventsStub = sinon.stub(BuildEvents, 'buildEventsFromDhisEventAnalytics');
      });

      beforeEach(() => {
        buildEventsStub.resolves([]);
        buildEventsStub.resetHistory();
      });

      after(() => {
        buildEventsStub.restore();
      });

      describe('buildEventsFromDhisEventAnalytics() invocation', () => {
        it('simple data elements', async () => {
          const getEventAnalyticsResponse = {
            headers: [
              { name: 'POP01', column: 'Population 1', valueType: 'NUMBER' },
              { name: 'POP02', column: 'Population 2', valueType: 'NUMBER' },
            ],
            metaData: {
              items: {
                POP01: { name: 'Population 1' },
                POP02: { name: 'Population 2' },
              },
              dimensions: { POP01: [], POP02: [] },
            },
            rows: [],
          };
          dhisApi = stubDhisApi({ getEventAnalyticsResponse });
          const dataElementCodes = ['POP01', 'POP02'];

          await dhisService.pull([DATA_SOURCES.POP01_GROUP], 'dataGroup', {
            ...basicOptions,
            dataElementCodes,
          });
          expect(BuildEvents.buildEventsFromDhisEventAnalytics).to.have.been.calledOnceWithExactly(
            getEventAnalyticsResponse,
            dataElementCodes,
          );
        });

        it('data elements with with data source codes different than DHIS2 codes', async () => {
          const getEventAnalyticsResponse = {
            headers: [{ name: 'DIF01_DHIS', column: 'Different 1', valueType: 'NUMBER' }],
            metaData: {
              items: {
                DIF01_DHIS: { name: 'Different 1' },
              },
              dimensions: {
                DIF01_DHIS: [],
              },
            },
            rows: [],
          };
          const translatedEventAnalyticsResponse = {
            headers: [{ name: 'DIF01', column: 'Different 1', valueType: 'NUMBER' }],
            metaData: {
              items: {
                DIF01: { name: 'Different 1' },
              },
              dimensions: { DIF01: [] },
            },
            rows: [],
          };
          dhisApi = stubDhisApi({ getEventAnalyticsResponse });

          const dataElementCodes = ['DIF01'];
          await dhisService.pull([DATA_SOURCES.POP01_GROUP], 'dataGroup', {
            ...basicOptions,
            dataElementCodes,
          });
          expect(BuildEvents.buildEventsFromDhisEventAnalytics).to.have.been.calledOnceWith(
            translatedEventAnalyticsResponse,
            dataElementCodes,
          );
        });
      });

      it('directly returns the buildEventsFromDhisEventAnalytics() results', () => {
        const events = [
          {
            eventId: 'event1_dhisId',
            period: '20200206',
            organisationUnit: 'TO_Nukuhc',
            values: {
              POP01: 1,
              POP02: 2,
            },
          },
        ];
        buildEventsStub.resolves(events);

        return expect(
          dhisService.pull([DATA_SOURCES.POP01_GROUP], 'dataGroup', basicOptions),
        ).to.eventually.deep.equal(events);
      });
    });
  });

  describe('data group - deprecated API', () => {
    testPullEvents_Deprecated({ dhisApi, dhisService });
  });
};
