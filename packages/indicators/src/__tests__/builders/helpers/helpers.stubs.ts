/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregation } from '../../../types';
import { AggregationResponseConfig } from './helpers.fixtures';
import { Aggregator } from '@tupaia/aggregator';

export const createAggregator = (responseConfig: AggregationResponseConfig) => {
  /**
   * Looks for the provided codes and `aggregations` in the `responseConfig`
   * and returns all the results for matched items
   */
  const fetchAnalytics = async (
    codes: string[],
    _: unknown,
    aggregationOptions: { aggregations: Aggregation[] },
  ) => {
    const { aggregations } = aggregationOptions;
    const results = Object.entries(responseConfig)
      .filter(([code, { expectedAggregations }]) => {
        const aggregationsAreExpected =
          JSON.stringify(aggregations) === JSON.stringify(expectedAggregations);
        return codes.includes(code) && aggregationsAreExpected;
      })
      .map(([, value]) => value.results)
      .reduce((res, r) => res.concat(r), []);

    return { results };
  };

  return { fetchAnalytics: jest.fn(fetchAnalytics) } as Aggregator;
};
