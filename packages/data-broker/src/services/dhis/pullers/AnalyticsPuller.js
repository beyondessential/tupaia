/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';
import keyBy from 'lodash.keyby';

import { buildAnalyticsFromDhisAnalytics, buildAnalyticsFromDhisEventAnalytics } from '../builders';

export class AnalyticsPuller {
  constructor(models, translator, dataElementsMetadataPuller) {
    this.models = models;
    this.translator = translator;
    this.dataElementsMetadataPuller = dataElementsMetadataPuller;
  }

  groupDataSourcesByDhisDataType = dataSources =>
    groupBy(
      dataSources,
      d => d.config?.dhisDataType || this.models.dataElement.getDhisDataTypes().DATA_ELEMENT,
    );

  groupIndicatorDataSourcesByPeriodType = dataSources => {
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

  getAnalyticsQueryParameters = (dataSources, options) => {
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

  pullAnalyticsForDhisDataType = async (apis, dataSources, options, dhisDataType) => {
    const pullAnalyticsForApi = this.getPullAnalyticsForApiMethod({ ...options, dhisDataType });
    const response = {
      results: [],
      metadata: {
        dataElementCodeToName: {},
      },
    };
    const pullAnalyticsForOptions = async (api, dataSourceList, pullOptions) => {
      const { results, metadata } = await pullAnalyticsForApi(api, dataSourceList, pullOptions);
      response.results.push(...results);
      response.metadata = {
        dataElementCodeToName: {
          ...(response.metadata?.dataElementCodeToName || {}),
          ...(metadata?.dataElementCodeToName || {}),
        },
      };
    };
    const pullForApi = async api => {
      if (dhisDataType === this.models.dataElement.getDhisDataTypes().INDICATOR) {
        // Multiple DHIS Indicators may have different period types,
        // so we have to group them by their period types and fetch them separately
        const groupedDataSourcesByPeriodType = this.groupIndicatorDataSourcesByPeriodType(
          dataSources,
        );
        return Promise.all(
          Object.entries(groupedDataSourcesByPeriodType).map(
            ([dataPeriodType, groupedDataSources]) => {
              const newOptions =
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

  pullAnalyticsForApi = async (api, dataSources, options) => {
    const queryInput = this.getAnalyticsQueryParameters(dataSources, {
      ...options,
      additionalDimensions: ['co'],
    });
    const rawData = await api.getAnalytics(queryInput);
    const translatedData = this.translator.translateInboundAnalytics(rawData, dataSources);
    return buildAnalyticsFromDhisAnalytics(translatedData);
  };

  pullAggregatedAnalyticsForApi = async (api, dataSources, options) => {
    const queryInput = this.getAnalyticsQueryParameters(dataSources, options);
    const aggregateData = await api.getAggregatedAnalytics(queryInput);
    const translatedData = this.translator.translateInboundAnalytics(aggregateData, dataSources);
    return buildAnalyticsFromDhisAnalytics(translatedData);
  };

  fetchEventAnalyticsForPrograms = async (api, programCodes, query) => {
    const allHeaders = [];
    let metaData = { items: {}, dimensions: {} };
    let width = 0;
    let height = 0;
    const rows = [];

    const fetchAnalyticsForProgram = async programCode => {
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

  pullAnalyticsFromEventsForApi = async (api, dataSources, options) => {
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

  getPullAnalyticsForApiMethod = options => {
    const {
      programCodes,
      dhisDataType = this.models.dataElement.getDhisDataTypes().DATA_ELEMENT,
    } = options;

    if (programCodes) {
      return this.pullAnalyticsFromEventsForApi;
    }
    return dhisDataType === this.models.dataElement.getDhisDataTypes().INDICATOR
      ? this.pullAggregatedAnalyticsForApi
      : this.pullAnalyticsForApi;
  };

  pull = async (apis, dataSources, options) => {
    const dataSourcesByDhisType = this.groupDataSourcesByDhisDataType(dataSources);
    const response = {
      results: [],
      metadata: {
        dataElementCodeToName: {},
      },
    };
    // To support pulling analytics for both DataElement and Indicator at the same time
    const pullForDhisDataType = async (dhisDataType, groupedDataSources) => {
      const { results, metadata } = await this.pullAnalyticsForDhisDataType(
        apis,
        groupedDataSources,
        options,
        dhisDataType,
      );
      response.results.push(...results);
      response.metadata = {
        dataElementCodeToName: {
          ...(response.metadata?.dataElementCodeToName || {}),
          ...(metadata?.dataElementCodeToName || {}),
        },
      };
    };

    await Promise.all(
      Object.entries(dataSourcesByDhisType).map(([dhisDataType, groupedDataSources]) =>
        pullForDhisDataType(dhisDataType, groupedDataSources),
      ),
    );

    return response;
  };
}
