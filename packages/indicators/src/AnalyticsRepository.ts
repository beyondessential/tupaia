/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';

import {
  adjustFetchOptionsToAggregationList,
  adjustFetchOptionsToAggregationLists,
  Aggregator,
  keepAnalyticsMatchingFetchOptions,
} from '@tupaia/aggregator';
import { Aggregation, AggregationList, Analytic, FetchOptions } from './types';

interface Fields {
  analyticsByElement: Record<string, Analytic[]>;
  fetchOptions: FetchOptions;
}

/**
 * This class encapsulates analytics fetching and retrieval of fetched data. The motivation
 * behind it is to optimise data fetches by minimising their count.
 *
 * An example:
 * * Indicator A wants to fetch FINAL_EACH_YEAR data for element BCD
 * * Indicator B wants to fetch FINAL_EACH_YEAR for element BCD and a year offset of -1
 * ("get me the results for the previous year")
 * * The original date range is 2018 - 2020
 *
 * We can combine both fetches in one, and fetch BCD for years 2017 - 2020, so that we can include
 * -1 offset data for the 2018 boundary.
 *
 * This means that the "scope" of the fetched data will be wider than the the original.
 * This class hides the scope transformation and allows each client (indicator) to retrieve
 * correct data based on the original scope (`fetchOptions`).
 */
export class AnalyticsRepository {
  private aggregator: Aggregator;

  private fetchedFields: Fields | null = null;

  constructor(aggregator: Aggregator) {
    this.aggregator = aggregator;
  }

  private get fields(): Fields {
    if (!this.fetchedFields) {
      throw new Error('Please run the "fetch" method first!');
    }
    return this.fetchedFields;
  }

  private set fields(fetchFields: Fields) {
    this.fetchedFields = fetchFields;
  }

  /**
   * @param aggregationLists All aggregation lists that will be used to aggregate the fetched elements
   */
  async fetch(
    dataElementCodes: string[],
    aggregationLists: AggregationList[],
    fetchOptions: FetchOptions,
  ) {
    const expandedOptions = adjustFetchOptionsToAggregationLists(fetchOptions, aggregationLists);
    const { results: analytics } = await this.aggregator.fetchAnalytics(
      dataElementCodes,
      expandedOptions,
    );
    this.fields = {
      analyticsByElement: groupBy(analytics, 'dataElement'),
      fetchOptions,
    };
  }

  getAggregatedAnalytics = (dataElement: string, aggregationList: AggregationList) => {
    const analytics = this.fields.analyticsByElement[dataElement];
    if (!analytics) {
      return [];
    }

    const adjustedOptions = adjustFetchOptionsToAggregationList(
      this.fields.fetchOptions,
      aggregationList,
    );
    const analyticsMatchingOptions = keepAnalyticsMatchingFetchOptions(analytics, adjustedOptions);
    return this.aggregator.aggregateAnalytics(
      analyticsMatchingOptions,
      aggregationList,
      adjustedOptions.period,
    );
  };
}
