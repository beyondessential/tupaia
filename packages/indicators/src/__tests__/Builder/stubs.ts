/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '@tupaia/aggregator';
import { createJestMockInstance } from '@tupaia/utils';
import { Aggregation, Analytic } from '../../types';

export type AnalyticResponseFixture = {
  code: string;
  aggregations: Aggregation[];
  analytic: Analytic;
};

export const createAggregator = (
  analyticResponseFixtures: AnalyticResponseFixture[] = [],
): Aggregator => {
  /**
   * Looks for the provided codes and aggregations in the input
   * and returns analytics for all matched items
   */
  const fetchAnalytics = async (
    codeInput: string[],
    _: unknown,
    aggregationOptions: { aggregations: Aggregation[] },
  ) => ({
    results: analyticResponseFixtures
      .filter(
        ({ code, aggregations }) =>
          codeInput.includes(code) &&
          JSON.stringify(aggregationOptions.aggregations) === JSON.stringify(aggregations),
      )
      .map(({ analytic }) => analytic),
  });

  return createJestMockInstance('@tupaia/aggregator', 'Aggregator', { fetchAnalytics });
};
