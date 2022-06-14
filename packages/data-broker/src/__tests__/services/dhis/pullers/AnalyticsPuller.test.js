/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import * as BuildAnalytics from '../../../../services/dhis/buildAnalytics/buildAnalyticsFromDhisEventAnalytics';
import { AnalyticsPuller } from '../../../../services/dhis/pullers/AnalyticsPuller';
import { DATA_SOURCES, EVENT_ANALYTICS } from '../DhisService.fixtures';
import {
  buildDhisAnalyticsResponse,
  createModelsStub,
  createMockDhisApi,
  stubGetDhisApi,
} from '../DhisService.stubs';
import { DhisTranslator } from '../../../../services/dhis/DhisTranslator';
import { DataElementsMetadataPuller } from '../../../../services/dhis/pullers';

describe('AnalyticsPuller', () => {
  let analyticsPuller;
  let dhisApi;

  beforeEach(() => {
    const models = createModelsStub();
    const translator = new DhisTranslator(models);
    const dataElementsMetadataPuller = new DataElementsMetadataPuller(
      models.dataElement,
      translator,
    );
    analyticsPuller = new AnalyticsPuller(
      models.dataElement,
      translator,
      dataElementsMetadataPuller,
    );
    dhisApi = createMockDhisApi();
    stubGetDhisApi(dhisApi);
  });

  describe('data source selection', () => {
    let analyticsSpy;
    let analyticsFromEventsSpy;

    beforeEach(() => {
      analyticsSpy = jest.spyOn(analyticsPuller, 'pullAnalyticsForApi');
      analyticsFromEventsSpy = jest.spyOn(analyticsPuller, 'pullAnalyticsFromEventsForApi');
    });

    it('pulls aggregate data by default', async () => {
      await analyticsPuller.pull([dhisApi], [DATA_SOURCES.POP01], {});
      expect(analyticsSpy).toHaveBeenCalledTimes(1);
      expect(analyticsFromEventsSpy).not.toHaveBeenCalled();
    });

    it('pulls event data if `programCodes` are provided', async () => {
      await analyticsPuller.pull([dhisApi], [DATA_SOURCES.POP01], {
        programCodes: ['POP01'],
      });
      expect(analyticsSpy).not.toHaveBeenCalled();
      expect(analyticsFromEventsSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('from aggregate data', () => {
    describe('DHIS API invocation', () => {
      const assertAnalyticsApiWasInvokedCorrectly = async ({
        dataSources,
        options = {},
        invocationArgs,
      }) => {
        await analyticsPuller.pull([dhisApi], dataSources, options);
        expect(dhisApi.getAnalytics).toHaveBeenCalledOnceWith(invocationArgs);
      };

      it('single data element', async () =>
        assertAnalyticsApiWasInvokedCorrectly({
          dataSources: [DATA_SOURCES.POP01],
          invocationArgs: expect.objectContaining({ dataElementCodes: ['POP01'] }),
        }));

      it('single data element with different DHIS code', async () =>
        assertAnalyticsApiWasInvokedCorrectly({
          dataSources: [DATA_SOURCES.DIF01],
          invocationArgs: expect.objectContaining({ dataElementCodes: ['DIF01_DHIS'] }),
        }));

      it('multiple data elements', async () =>
        assertAnalyticsApiWasInvokedCorrectly({
          dataSources: [DATA_SOURCES.POP01, DATA_SOURCES.POP02],
          invocationArgs: expect.objectContaining({ dataElementCodes: ['POP01', 'POP02'] }),
        }));

      it('supports various API options', async () => {
        const options = {
          outputIdScheme: 'code',
          organisationUnitCodes: ['TO', 'PG'],
          period: '20200822',
          startDate: '20200731',
          endDate: '20200904',
          additionalDimensions: ['co'],
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
        dhisApi = createMockDhisApi({
          getAnalyticsResponse: buildDhisAnalyticsResponse(expectedResults.results),
        });
        stubGetDhisApi(dhisApi);
        return expect(analyticsPuller.pull([dhisApi], dataSources, options)).resolves.toStrictEqual(
          expectedResults,
        );
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
    };

    let buildAnalyticsMock;

    beforeAll(() => {
      buildAnalyticsMock = jest.spyOn(BuildAnalytics, 'buildAnalyticsFromDhisEventAnalytics');
    });

    describe('DHIS API invocation', () => {
      const assertEventAnalyticsApiWasInvokedOnceWith = async ({
        dataSources,
        options = {},
        invocationArgs,
      }) => {
        await analyticsPuller.pull([dhisApi], dataSources, options);
        expect(dhisApi.getEventAnalytics).toHaveBeenCalledOnceWith(invocationArgs);
      };

      it('no program', async () => {
        await analyticsPuller.pull([dhisApi], [DATA_SOURCES.POP01, DATA_SOURCES.POP02]);
        expect(dhisApi.getEventAnalytics).not.toHaveBeenCalled();
      });

      it('single program', async () => {
        await analyticsPuller.pull([dhisApi], [DATA_SOURCES.POP01, DATA_SOURCES.POP02], {
          programCodes: ['POP01'],
        });
        expect(dhisApi.getEventAnalytics).toHaveBeenCalledWith(
          expect.objectContaining({ programCode: 'POP01' }),
        );
      });

      it('multiple programs', async () => {
        await analyticsPuller.pull([dhisApi], [DATA_SOURCES.POP01, DATA_SOURCES.POP02], {
          programCodes: ['POP01', 'DIFF_GROUP'],
        });
        expect(dhisApi.getEventAnalytics).toHaveBeenCalledWith(
          expect.objectContaining({
            programCode: 'POP01',
          }),
        );
        expect(dhisApi.getEventAnalytics).toHaveBeenCalledWith(
          expect.objectContaining({
            programCode: 'DIFF_GROUP',
          }),
        );
        expect(dhisApi.getEventAnalytics).toHaveBeenCalledTimes(2);
      });

      it('program with org unit code', async () => {
        await analyticsPuller.pull([dhisApi], [DATA_SOURCES.POP01], {
          programCodes: ['POP01'],
          organisationUnitCode: 'TO',
        });
        expect(dhisApi.getEventAnalytics).toHaveBeenCalledWith(
          expect.objectContaining({ organisationUnitCodes: ['TO'] }),
        );
      });

      it('program with org unit codes', async () => {
        await analyticsPuller.pull([dhisApi], [DATA_SOURCES.POP01], {
          programCodes: ['POP01'],
          organisationUnitCodes: ['TO', 'XY'],
        });
        expect(dhisApi.getEventAnalytics).toHaveBeenCalledWith(
          expect.objectContaining({ organisationUnitCodes: ['TO', 'XY'] }),
        );
      });

      it('simple data elements', () =>
        assertEventAnalyticsApiWasInvokedOnceWith({
          dataSources: [DATA_SOURCES.POP01, DATA_SOURCES.POP02],
          options: basicOptions,
          invocationArgs: expect.objectContaining({
            dataElementCodes: ['POP01', 'POP02'],
          }),
        }));

      it('data elements with data source codes different than DHIS2 codes', () =>
        assertEventAnalyticsApiWasInvokedOnceWith({
          dataSources: [DATA_SOURCES.POP01, DATA_SOURCES.DIF01],
          options: basicOptions,
          invocationArgs: expect.objectContaining({
            dataElementCodes: ['POP01', 'DIF01_DHIS'],
          }),
        }));

      it('forces `dataElementIdScheme` option to `code`', async () =>
        assertEventAnalyticsApiWasInvokedOnceWith({
          dataSources: [DATA_SOURCES.POP01],
          options: { ...basicOptions, dataElementIdScheme: 'id' },
          invocationArgs: expect.objectContaining({ dataElementIdScheme: 'code' }),
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
          invocationArgs: expect.objectContaining(options),
        });
      });
    });

    describe('data building', () => {
      describe('buildAnalyticsFromDhisEventAnalytics() invocation', () => {
        beforeAll(() => {
          buildAnalyticsMock.mockReturnValue({
            results: [],
            metadata: { dataElementCodeToName: {} },
          });
        });

        it('no program', async () => {
          const emptyEventAnalytics = {
            headers: [],
            metaData: { items: {}, dimensions: {} },
            width: 0,
            height: 0,
            rows: [],
          };
          const dataElementCodes = ['POP01'];

          await analyticsPuller.pull([dhisApi], [DATA_SOURCES.POP01], { programCodes: [] });
          expect(buildAnalyticsMock).toHaveBeenCalledOnceWith(
            expect.objectContaining(emptyEventAnalytics),
            dataElementCodes,
          );
        });

        it('simple data elements', async () => {
          const getEventAnalyticsResponse = EVENT_ANALYTICS.sameDhisElementCodes;
          dhisApi = createMockDhisApi({
            getEventAnalyticsResponse,
          });
          stubGetDhisApi(dhisApi);
          const dataElementCodes = ['POP01', 'POP02'];

          await analyticsPuller.pull([dhisApi], [DATA_SOURCES.POP01, DATA_SOURCES.POP02], {
            ...basicOptions,
            dataElementCodes,
          });
          expect(buildAnalyticsMock).toHaveBeenCalledOnceWith(
            getEventAnalyticsResponse,
            dataElementCodes,
          );
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
          dhisApi = createMockDhisApi({
            getEventAnalyticsResponse,
          });
          stubGetDhisApi(dhisApi);
          const dataElementCodes = ['DIF01'];
          await analyticsPuller.pull([dhisApi], [DATA_SOURCES.DIF01], {
            ...basicOptions,
            dataElementCodes,
          });
          expect(buildAnalyticsMock).toHaveBeenCalledOnceWith(
            translatedEventAnalytics,
            dataElementCodes,
          );
        });
      });

      it('directly returns the buildAnalyticsFromDhisEventAnalytics() results', () => {
        const analyticsResponse = {
          results: [
            { period: '20200206', organisationUnit: 'TO_Nukuhc', dataElement: 'POP01', value: 1 },
          ],
          metadata: { dataElementCodeToName: { POP01: 'Population 1' } },
        };
        buildAnalyticsMock.mockReturnValue(analyticsResponse);

        return expect(
          analyticsPuller.pull([dhisApi], [DATA_SOURCES.POP01], basicOptions),
        ).resolves.toStrictEqual(analyticsResponse);
      });
    });
  });
});
