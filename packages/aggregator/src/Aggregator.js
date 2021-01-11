/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  adjustTemporalDimensionsToAggregation,
  aggregateAnalytics,
  filterAnalytics,
  periodFromAnalytics,
} from './analytics';
import { aggregateEvents } from './events';
import { AGGREGATION_TYPES } from './aggregationTypes';

export class Aggregator {
  static aggregationTypes = AGGREGATION_TYPES;

  constructor(dataBroker) {
    this.dataBroker = dataBroker;
  }

  async close() {
    return this.dataBroker.close();
  }

  get aggregationTypes() {
    return Aggregator.aggregationTypes;
  }

  get dataSourceTypes() {
    return this.dataBroker.getDataSourceTypes();
  }

  processAnalytics = (analytics, aggregationOptions, requestedPeriod) => {
    const { aggregations = [], filter } = aggregationOptions;
    const aggregatedAnalytics = this.aggregateAnalytics(analytics, aggregations, requestedPeriod);
    return filterAnalytics(aggregatedAnalytics, filter);
  };

  aggregateAnalytics = (analytics, aggregations, requestedPeriod) =>
    aggregations.reduce((partiallyAggregatedAnalytics, { type, config }) => {
      return aggregateAnalytics(partiallyAggregatedAnalytics, type, {
        ...config,
        requestedPeriod,
      });
    }, analytics);

  async fetchAnalytics(codeInput, fetchOptions, aggregationOptions = {}) {
    const { organisationUnitCode, organisationUnitCodes } = fetchOptions;
    if (!organisationUnitCode && (!organisationUnitCodes || !organisationUnitCodes.length)) {
      // No organisation unit code, return empty response
      return {
        results: [],
        metadata: {
          dataElementCodeToName: {},
        },
        period: periodFromAnalytics([], fetchOptions),
      };
    }
    const code = Array.isArray(codeInput) ? codeInput : [codeInput];
    const dataSourceSpec = { code, type: this.dataSourceTypes.DATA_ELEMENT };
    const { startDate, endDate, period, ...restOfFetchOptions } = fetchOptions;
    const temporalDimensions = adjustTemporalDimensionsToAggregation(
      { startDate, endDate, period },
      aggregationOptions,
    );

    const { results, metadata } = await this.dataBroker.pull(dataSourceSpec, {
      ...restOfFetchOptions,
      ...temporalDimensions,
    });

    return {
      results: this.processAnalytics(results, aggregationOptions, period),
      metadata,
      period: periodFromAnalytics(results, fetchOptions),
    };
  }

  processEvents = (events, aggregationOptions) => {
    const { aggregations = [] } = aggregationOptions;
    const aggregatedEvents = aggregations.reduce(
      (partiallyAggregatedEvents, { type, config }) =>
        aggregateEvents(partiallyAggregatedEvents, type, config),
      events,
    );
    return aggregatedEvents;
  };

  async fetchEvents(code, fetchOptions, aggregationOptions = {}) {
    const { organisationUnitCode, organisationUnitCodes } = fetchOptions;
    if (!organisationUnitCode && (!organisationUnitCodes || !organisationUnitCodes.length)) {
      return [];
    }
    const dataSourceSpec = { code, type: this.dataSourceTypes.DATA_GROUP };
    const events = await this.dataBroker.pull(dataSourceSpec, fetchOptions);

    return this.processEvents(events, aggregationOptions);
  }

  async fetchDataElements(codes, fetchOptions) {
    const dataSourceSpec = { code: codes, type: this.dataSourceTypes.DATA_ELEMENT };
    return this.dataBroker.pullMetadata(dataSourceSpec, fetchOptions);
  }

  async fetchDataGroup(code, fetchOptions) {
    const dataSourceSpec = { code, type: this.dataSourceTypes.DATA_GROUP };
    return this.dataBroker.pullMetadata(dataSourceSpec, fetchOptions);
  }

  // TODO ultimately Aggregator should handle preaggregation internally - at that point this method
  // could be removed
  async pushAggregateData(data) {
    if (data.length === 0) return null;
    const codes = data.map(dataValue => dataValue.code);
    const dataSourceSpec = { code: codes, type: this.dataSourceTypes.DATA_ELEMENT };
    const { diagnostics } = await this.dataBroker.push(dataSourceSpec, data);
    return diagnostics;
  }

  // TODO ultimately Aggregator should handle preaggregation internally - at that point this method
  // could be removed
  async deleteAggregateDataValue(dataValue) {
    const dataSourceSpec = {
      code: dataValue.code,
      type: this.dataSourceTypes.DATA_ELEMENT,
    };
    return this.dataBroker.delete(dataSourceSpec, dataValue);
  }
}
