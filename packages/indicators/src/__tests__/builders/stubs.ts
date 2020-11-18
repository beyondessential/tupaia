/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '@tupaia/aggregator';
import { createJestMockInstance } from '@tupaia/utils';
import { Analytic, Aggregation } from '../../types';

export type AnalyticResponseFixture = {
  code: string;
  aggregations: Aggregation[];
  analytic: Analytic;
};

export const createAggregator = (responseFixtures: AnalyticResponseFixture[] = []): Aggregator => {
  /**
   * Looks for the provided codes and aggregations in the input
   * and returns analytics for all matched items
   */
  const fetchAnalytics = async (
    codeInput: string[],
    _: unknown,
    aggregationOptions: { aggregations: Aggregation[] },
  ) => ({
    results: responseFixtures
      .filter(
        ({ code, aggregations }) =>
          codeInput.includes(code) &&
          JSON.stringify(aggregationOptions.aggregations) === JSON.stringify(aggregations),
      )
      .map(({ analytic }) => analytic),
  });

  return createJestMockInstance('@tupaia/aggregator', 'Aggregator', { fetchAnalytics });
};
