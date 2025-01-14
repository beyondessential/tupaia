import * as BuildAnalytics from '../../../../services/dhis/builders/buildAnalyticsFromDhisEventAnalytics';
import { AnalyticsPuller } from '../../../../services/dhis/pullers/AnalyticsPuller';
import { DATA_ELEMENTS, EVENT_ANALYTICS } from '../DhisService.fixtures';
import {
  buildDhisAnalyticsResponse,
  createModelsStub,
  createMockDhisApi,
} from '../DhisService.stubs';
import { DhisTranslator } from '../../../../services/dhis/translators/DhisTranslator';
import {
  PullAnalyticsOptions,
  DataElementsMetadataPuller,
} from '../../../../services/dhis/pullers';
import { DataServiceMapping } from '../../../../services/DataServiceMapping';

describe('AnalyticsPuller', () => {
  const dataServiceMapping = new DataServiceMapping();

  const models = createModelsStub();
  const translator = new DhisTranslator(models);
  const dataElementsMetadataPuller = new DataElementsMetadataPuller(models.dataElement, translator);
  const analyticsPuller = new AnalyticsPuller(models, translator, dataElementsMetadataPuller);

  describe('from aggregate data', () => {
    describe('DHIS API invocation', () => {
      const dhisApi = createMockDhisApi();

      it('single data element', async () => {
        await analyticsPuller.pull([dhisApi], [DATA_ELEMENTS.POP01], { dataServiceMapping });
        expect(dhisApi.getAnalytics).toHaveBeenCalledOnceWith(
          expect.objectContaining({ dataElementCodes: ['POP01'] }),
        );
      });

      it('single data element with different DHIS code', async () => {
        await analyticsPuller.pull([dhisApi], [DATA_ELEMENTS.DIF01], { dataServiceMapping });
        expect(dhisApi.getAnalytics).toHaveBeenCalledOnceWith(
          expect.objectContaining({ dataElementCodes: ['DIF01_DHIS'] }),
        );
      });

      it('multiple data elements', async () => {
        await analyticsPuller.pull([dhisApi], [DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], {
          dataServiceMapping,
        });
        expect(dhisApi.getAnalytics).toHaveBeenCalledOnceWith(
          expect.objectContaining({ dataElementCodes: ['POP01', 'POP02'] }),
        );
      });

      it('supports various API options', async () => {
        const apiOptions = {
          outputIdScheme: 'code',
          organisationUnitCodes: ['TO', 'PG'],
          period: '20200822',
          startDate: '20200731',
          endDate: '20200904',
          additionalDimensions: ['co'],
        };

        await analyticsPuller.pull([dhisApi], [DATA_ELEMENTS.POP01], {
          ...apiOptions,
          dataServiceMapping,
        });
        expect(dhisApi.getAnalytics).toHaveBeenCalledOnceWith(
          expect.objectContaining({ dataElementCodes: ['POP01'], ...apiOptions }),
        );
      });
    });

    describe('data pulling', () => {
      const basicOptions = {
        dataServiceMapping,
        organisationUnitCodes: ['TO'],
      };

      it('single data element', async () => {
        const dhisAnalytics = [
          { dataElement: 'POP01', organisationUnit: 'TO', value: 1, period: '20200101' },
        ];
        const dhisApi = createMockDhisApi({
          getAnalyticsResponse: buildDhisAnalyticsResponse(dhisAnalytics),
        });

        const results = await analyticsPuller.pull([dhisApi], [DATA_ELEMENTS.POP01], basicOptions);
        expect(results).toStrictEqual({
          results: dhisAnalytics,
          metadata: { dataElementCodeToName: { POP01: 'Population 1' } },
        });
      });

      it('single data element with a different DHIS code', async () => {
        const dhisAnalytics = [
          { dataElement: 'DIF01', organisationUnit: 'TO', value: 3, period: '20200103' },
        ];
        const dhisApi = createMockDhisApi({
          getAnalyticsResponse: buildDhisAnalyticsResponse(dhisAnalytics),
        });

        const results = await analyticsPuller.pull([dhisApi], [DATA_ELEMENTS.DIF01], basicOptions);
        expect(results).toStrictEqual({
          results: dhisAnalytics,
          metadata: {
            dataElementCodeToName: { DIF01: 'Different 1' },
          },
        });
      });

      it('multiple data elements', async () => {
        const dhisAnalytics = [
          { dataElement: 'POP01', organisationUnit: 'TO', value: 1, period: '20200101' },
          { dataElement: 'POP02', organisationUnit: 'TO', value: 2, period: '20200102' },
        ];
        const dhisApi = createMockDhisApi({
          getAnalyticsResponse: buildDhisAnalyticsResponse(dhisAnalytics),
        });

        const results = await analyticsPuller.pull(
          [dhisApi],
          [DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02],
          basicOptions,
        );
        expect(results).toStrictEqual({
          results: dhisAnalytics,
          metadata: {
            dataElementCodeToName: { POP01: 'Population 1', POP02: 'Population 2' },
          },
        });
      });
    });
  });

  describe('from event data', () => {
    const basicOptions = {
      dataServiceMapping,
      programCodes: ['POP01'],
    };
    const buildAnalyticsMock = jest.spyOn(BuildAnalytics, 'buildAnalyticsFromDhisEventAnalytics');

    describe('DHIS API invocation', () => {
      const dhisApi = createMockDhisApi();

      it('no program', async () => {
        await analyticsPuller.pull([dhisApi], [DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], {
          dataServiceMapping,
        });
        expect(dhisApi.getEventAnalytics).not.toHaveBeenCalled();
      });

      it('single program', async () => {
        await analyticsPuller.pull([dhisApi], [DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], {
          dataServiceMapping,
          programCodes: ['POP01'],
        });
        expect(dhisApi.getEventAnalytics).toHaveBeenCalledWith(
          expect.objectContaining({ programCode: 'POP01' }),
        );
      });

      it('multiple programs', async () => {
        await analyticsPuller.pull([dhisApi], [DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], {
          dataServiceMapping,
          programCodes: ['POP01', 'DIFF_GROUP'],
        });
        expect(dhisApi.getEventAnalytics).toHaveBeenCalledWith(
          expect.objectContaining({ programCode: 'POP01' }),
        );
        expect(dhisApi.getEventAnalytics).toHaveBeenCalledWith(
          expect.objectContaining({ programCode: 'DIFF_GROUP' }),
        );
        expect(dhisApi.getEventAnalytics).toHaveBeenCalledTimes(2);
      });

      it('program with org unit code', async () => {
        await analyticsPuller.pull([dhisApi], [DATA_ELEMENTS.POP01], {
          dataServiceMapping,
          programCodes: ['POP01'],
          organisationUnitCode: 'TO',
        });
        expect(dhisApi.getEventAnalytics).toHaveBeenCalledWith(
          expect.objectContaining({ organisationUnitCodes: ['TO'] }),
        );
      });

      it('program with org unit codes', async () => {
        await analyticsPuller.pull([dhisApi], [DATA_ELEMENTS.POP01], {
          dataServiceMapping,
          programCodes: ['POP01'],
          organisationUnitCodes: ['TO', 'XY'],
        });
        expect(dhisApi.getEventAnalytics).toHaveBeenCalledWith(
          expect.objectContaining({ organisationUnitCodes: ['TO', 'XY'] }),
        );
      });

      it('simple data elements', async () => {
        await analyticsPuller.pull(
          [dhisApi],
          [DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02],
          basicOptions,
        );
        expect(dhisApi.getEventAnalytics).toHaveBeenCalledOnceWith(
          expect.objectContaining({ dataElementCodes: ['POP01', 'POP02'] }),
        );
      });

      it('data elements with data source codes different than DHIS2 codes', async () => {
        await analyticsPuller.pull(
          [dhisApi],
          [DATA_ELEMENTS.POP01, DATA_ELEMENTS.DIF01],
          basicOptions,
        );
        expect(dhisApi.getEventAnalytics).toHaveBeenCalledOnceWith(
          expect.objectContaining({ dataElementCodes: ['POP01', 'DIF01_DHIS'] }),
        );
      });

      it('forces `dataElementIdScheme` option to `code`', async () => {
        await analyticsPuller.pull([dhisApi], [DATA_ELEMENTS.POP01], {
          ...basicOptions,
          dataElementIdScheme: 'id',
        } as PullAnalyticsOptions);
        expect(dhisApi.getEventAnalytics).toHaveBeenCalledOnceWith(
          expect.objectContaining({ dataElementIdScheme: 'code' }),
        );
      });

      it('supports various API options', async () => {
        const options = {
          period: '20200427',
          startDate: '20200731',
          endDate: '20200904',
        };

        await analyticsPuller.pull([dhisApi], [DATA_ELEMENTS.POP01], {
          ...basicOptions,
          ...options,
        });
        expect(dhisApi.getEventAnalytics).toHaveBeenCalledOnceWith(
          expect.objectContaining(options),
        );
      });
    });

    describe('data building', () => {
      describe('buildAnalyticsFromDhisEventAnalytics() invocation', () => {
        beforeAll(() => {
          buildAnalyticsMock.mockResolvedValue({
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
          const dhisApi = createMockDhisApi();

          await analyticsPuller.pull([dhisApi], [DATA_ELEMENTS.POP01], {
            dataServiceMapping,
            programCodes: [],
          });
          expect(buildAnalyticsMock).toHaveBeenCalledOnceWith(
            models,
            expect.objectContaining(emptyEventAnalytics),
            ['POP01'],
          );
        });

        it('simple data elements', async () => {
          const dhisEventAnalytics = EVENT_ANALYTICS.sameDhisElementCodes;
          const dhisApi = createMockDhisApi({
            getEventAnalyticsStub: async () => dhisEventAnalytics,
          });

          await analyticsPuller.pull(
            [dhisApi],
            [DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02],
            basicOptions,
          );
          expect(buildAnalyticsMock).toHaveBeenCalledOnceWith(models, dhisEventAnalytics, [
            'POP01',
            'POP02',
          ]);
        });

        it('data elements with data source codes different than DHIS2 codes', async () => {
          const dhisEventAnalytics = EVENT_ANALYTICS.differentDhisElementCodes;
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
          const dhisApi = createMockDhisApi({
            getEventAnalyticsStub: async () => dhisEventAnalytics,
          });

          await analyticsPuller.pull([dhisApi], [DATA_ELEMENTS.DIF01], basicOptions);
          expect(buildAnalyticsMock).toHaveBeenCalledOnceWith(models, translatedEventAnalytics, [
            'DIF01',
          ]);
        });
      });

      it('directly returns the buildAnalyticsFromDhisEventAnalytics() results', async () => {
        const analyticsResponse = {
          results: [
            { period: '20200206', organisationUnit: 'TO_Nukuhc', dataElement: 'POP01', value: 1 },
          ],
          metadata: { dataElementCodeToName: { POP01: 'Population 1' } },
        };
        buildAnalyticsMock.mockResolvedValue(analyticsResponse);
        const dhisApi = createMockDhisApi();

        const response = await analyticsPuller.pull([dhisApi], [DATA_ELEMENTS.POP01], basicOptions);
        expect(response).toStrictEqual(analyticsResponse);
      });
    });
  });
});
