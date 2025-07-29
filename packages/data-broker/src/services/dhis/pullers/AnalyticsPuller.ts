import { groupBy, keyBy } from 'es-toolkit/compat';

import type { DhisApi } from '@tupaia/dhis-api';
import { DataBrokerModelRegistry, RawAnalyticResults } from '../../../types';
import { DataServiceMapping } from '../../DataServiceMapping';
import { buildAnalyticsFromDhisAnalytics, buildAnalyticsFromDhisEventAnalytics } from '../builders';
import { DhisTranslator } from '../translators';
import { DataElement, DataType, DhisAnalytics, DhisEventAnalytics } from '../types';
import { DataElementsMetadataPuller } from './DataElementsMetadataPuller';

export type PullAnalyticsOptions = {
  dataServiceMapping: DataServiceMapping;
  organisationUnitCode?: string;
  organisationUnitCodes?: string[];
  programCodes?: string[];
  period?: string;
  startDate?: string;
  endDate?: string;
  dataPeriodType?: string;
};

export class AnalyticsPuller {
  private readonly models;
  private readonly translator;
  // @ts-ignore
  private readonly dataElementsMetadataPuller;

  public constructor(
    models: DataBrokerModelRegistry,
    translator: DhisTranslator,
    dataElementsMetadataPuller: DataElementsMetadataPuller,
  ) {
    this.models = models;
    this.translator = translator;
    this.dataElementsMetadataPuller = dataElementsMetadataPuller;
  }

  private groupDataSourcesByDhisDataType = (dataSources: DataElement[]) =>
    groupBy(
      dataSources,
      d => d.config?.dhisDataType || this.models.dataElement.getDhisDataTypes().DATA_ELEMENT,
    );

  private groupIndicatorDataSourcesByPeriodType = (dataSources: DataElement[]) => {
    if (
      dataSources.some(
        d =>
          d.config?.dhisDataType &&
          d.config.dhisDataType !== this.models.dataElement.getDhisDataTypes().INDICATOR,
      )
    ) {
      throw new Error('All data sources have to be DHIS indicators');
    }
    return groupBy(dataSources, d => d.config?.indicator?.dataPeriodType || 'NONE');
  };

  private getAnalyticsQueryParameters = (
    dataSources: DataElement[],
    options: PullAnalyticsOptions & { additionalDimensions?: string[] },
  ) => {
    const dataElementCodes = dataSources.map(({ dataElementCode }) => dataElementCode);
    const {
      organisationUnitCode,
      organisationUnitCodes,
      period,
      startDate,
      endDate,
      dataPeriodType,
      additionalDimensions,
    } = options;
    return {
      dataElementCodes,
      outputIdScheme: 'code',
      organisationUnitCodes: organisationUnitCode ? [organisationUnitCode] : organisationUnitCodes,
      period,
      startDate,
      endDate,
      dataPeriodType,
      additionalDimensions,
    };
  };

  private pullAnalyticsForDhisDataType = async (
    apis: DhisApi[],
    dataSources: DataElement[],
    options: PullAnalyticsOptions,
    dhisDataType?: DataType,
  ) => {
    const pullAnalyticsForApi = this.getPullAnalyticsForApiMethod({ ...options, dhisDataType });
    const response: RawAnalyticResults = {
      results: [],
      metadata: {
        dataElementCodeToName: {},
      },
    };
    const pullAnalyticsForOptions = async (
      api: DhisApi,
      dataSourceList: DataElement[],
      pullOptions: PullAnalyticsOptions,
    ) => {
      const { results, metadata } = await pullAnalyticsForApi(api, dataSourceList, pullOptions);
      response.results = [...response.results].concat(results);
      response.metadata = {
        dataElementCodeToName: {
          ...(response.metadata?.dataElementCodeToName || {}),
          ...(metadata?.dataElementCodeToName || {}),
        },
      };
    };
    const pullForApi = async (api: DhisApi) => {
      if (dhisDataType === this.models.dataElement.getDhisDataTypes().INDICATOR) {
        // Multiple DHIS Indicators may have different period types,
        // so we have to group them by their period types and fetch them separately
        const groupedDataSourcesByPeriodType =
          this.groupIndicatorDataSourcesByPeriodType(dataSources);
        return Promise.all(
          Object.entries(groupedDataSourcesByPeriodType).map(
            ([dataPeriodType, groupedDataSources]) => {
              const newOptions: PullAnalyticsOptions =
                dataPeriodType && dataPeriodType !== 'NONE' // ideally all indicator data sources should have their period types specified in the config
                  ? { ...options, dataPeriodType }
                  : options;
              return pullAnalyticsForOptions(api, groupedDataSources, newOptions);
            },
          ),
        );
      }

      return pullAnalyticsForOptions(api, dataSources, options);
    };

    await Promise.all(apis.map(pullForApi));
    return response;
  };

  private pullAnalyticsForApi = async (
    api: DhisApi,
    dataSources: DataElement[],
    options: PullAnalyticsOptions,
  ) => {
    const queryInput = this.getAnalyticsQueryParameters(dataSources, {
      ...options,
      additionalDimensions: ['co'],
    });
    const rawData: DhisAnalytics = await api.getAnalytics(queryInput);
    const translatedData = this.translator.translateInboundAnalytics(rawData, dataSources);
    return buildAnalyticsFromDhisAnalytics(translatedData);
  };

  private pullAggregatedAnalyticsForApi = async (
    api: DhisApi,
    dataSources: DataElement[],
    options: PullAnalyticsOptions,
  ) => {
    const queryInput = this.getAnalyticsQueryParameters(dataSources, options);
    const aggregateData = await api.getAggregatedAnalytics(queryInput);
    const translatedData = this.translator.translateInboundAnalytics(aggregateData, dataSources);
    return buildAnalyticsFromDhisAnalytics(translatedData);
  };

  private fetchEventAnalyticsForPrograms = async (
    api: DhisApi,
    programCodes: string[],
    query: Record<string, unknown>,
  ): Promise<DhisEventAnalytics> => {
    const allHeaders: DhisEventAnalytics['headers'] = [];
    let metaData = { items: {}, dimensions: {} } as DhisEventAnalytics['metaData'];
    let width = 0;
    let height = 0;
    const rows: DhisEventAnalytics['rows'] = [];

    const fetchAnalyticsForProgram = async (programCode: string) => {
      const newAnalytics = await api.getEventAnalytics({ ...query, programCode });

      allHeaders.push(...newAnalytics.headers);
      metaData = {
        items: { ...metaData.items, ...newAnalytics.metaData.items },
        dimensions: { ...metaData.dimensions, ...newAnalytics.metaData.dimensions },
      };
      width = newAnalytics.width;
      height += newAnalytics.height;
      rows.push(...newAnalytics.rows);
    };

    await Promise.all(programCodes.map(fetchAnalyticsForProgram));
    return {
      headers: Object.values(keyBy(allHeaders, 'name')),
      metaData,
      width,
      height,
      rows,
    };
  };

  private pullAnalyticsFromEventsForApi = async (
    api: DhisApi,
    dataSources: DataElement[],
    options: PullAnalyticsOptions,
  ) => {
    const {
      programCodes = [],
      period,
      startDate,
      endDate,
      organisationUnitCode,
      organisationUnitCodes,
    } = options;
    const dataElementCodes = dataSources.map(({ code }) => code);
    const dhisElementCodes = dataSources.map(({ dataElementCode }) => dataElementCode);

    const query = {
      programCodes,
      dataElementCodes: dhisElementCodes,
      dataElementIdScheme: 'code',
      organisationUnitCodes: organisationUnitCode ? [organisationUnitCode] : organisationUnitCodes,
      period,
      startDate,
      endDate,
    };
    const eventAnalytics = await this.fetchEventAnalyticsForPrograms(api, programCodes, query);

    const translatedEventAnalytics = await this.translator.translateInboundEventAnalytics(
      eventAnalytics,
      dataSources,
    );

    return buildAnalyticsFromDhisEventAnalytics(
      this.models,
      translatedEventAnalytics,
      dataElementCodes,
    );
  };

  private getPullAnalyticsForApiMethod = (
    options: PullAnalyticsOptions & {
      programCodes?: string[];
      dhisDataType?: DataType;
    },
  ) => {
    const { programCodes, dhisDataType = this.models.dataElement.getDhisDataTypes().DATA_ELEMENT } =
      options;

    if (programCodes) {
      return this.pullAnalyticsFromEventsForApi;
    }
    return dhisDataType === this.models.dataElement.getDhisDataTypes().INDICATOR
      ? this.pullAggregatedAnalyticsForApi
      : this.pullAnalyticsForApi;
  };

  public pull = async (
    apis: DhisApi[],
    dataSources: DataElement[],
    options: PullAnalyticsOptions,
  ) => {
    const dataSourcesByDhisType = this.groupDataSourcesByDhisDataType(dataSources);
    const response: RawAnalyticResults = {
      results: [],
      metadata: {
        dataElementCodeToName: {},
      },
    };
    // To support pulling analytics for both DataElement and Indicator at the same time
    const pullForDhisDataType = async (
      dhisDataType: DataType,
      groupedDataSources: DataElement[],
    ) => {
      const { results, metadata } = await this.pullAnalyticsForDhisDataType(
        apis,
        groupedDataSources,
        options,
        dhisDataType,
      );
      response.results = [...response.results].concat(results);
      response.metadata = {
        dataElementCodeToName: {
          ...(response.metadata?.dataElementCodeToName || {}),
          ...(metadata?.dataElementCodeToName || {}),
        },
      };
    };

    await Promise.all(
      Object.entries(dataSourcesByDhisType).map(([dhisDataType, groupedDataSources]) =>
        pullForDhisDataType(dhisDataType as DataType, groupedDataSources),
      ),
    );

    return response;
  };
}
