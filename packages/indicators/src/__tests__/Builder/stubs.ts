import { Aggregator } from '@tupaia/aggregator';
import { createJestMockInstance } from '@tupaia/utils';
import { Analytic } from '../../types';

export const createAggregator = (analyticFixtures: Analytic[] = []): Aggregator => {
  const fetchAnalytics = async (codes: string[]) => {
    const results = analyticFixtures.filter(({ dataElement }) => codes.includes(dataElement));
    return { results };
  };

  return createJestMockInstance('@tupaia/aggregator', 'Aggregator', { fetchAnalytics });
};
