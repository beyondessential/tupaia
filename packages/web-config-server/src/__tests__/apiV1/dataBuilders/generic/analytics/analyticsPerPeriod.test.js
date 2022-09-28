/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createJestMockInstance } from '@tupaia/utils';
import { analyticsPerPeriod } from '/apiV1/dataBuilders/generic/analytics/analyticsPerPeriod';

describe('analyticsPerPeriod', () => {
  // Define the results in non-ascending period order to assert that they are sorted correctly
  const ANALYTICS = [
    // Period: 20200101
    { dataElement: 'CASES', orgUnit: 'TO', period: '20200101', value: 11 },
    { dataElement: 'POP', orgUnit: 'TO', period: '20200101', value: 110 },
    // Period: 20190101
    { dataElement: 'CASES', orgUnit: 'TO', period: '20190101', value: 10 },
    { dataElement: 'POP', orgUnit: 'TO', period: '20190101', value: 100 },
  ];

  const TIMESTAMPS = {
    '2019-01-01T00:00:00Z': 1546300800000,
    '2020-01-01T00:00:00Z': 1577836800000,
  };

  const aggregator = createJestMockInstance('@tupaia/aggregator', 'Aggregator', {
    fetchAnalytics: jest.fn(async dataElementCodes => ({
      results: ANALYTICS.filter(({ dataElement }) => dataElementCodes.includes(dataElement)),
    })),
  });

  it('uses an `aggregationType` if specified in the config', async () => {
    const aggregationType = 'SUM';
    await analyticsPerPeriod(
      { dataBuilderConfig: { dataElementCode: 'CASES', aggregationType } },
      aggregator,
    );
    expect(aggregator.fetchAnalytics).toHaveBeenCalledOnceWith(
      expect.anything(),
      expect.anything(),
      undefined,
      expect.objectContaining({ aggregationType }),
    );
  });

  describe('series config', () => {
    const dataBuilderConfig = {
      series: [
        { key: 'cases', dataElementCode: 'CASES' },
        { key: 'population', dataElementCode: 'POP' },
      ],
    };

    it('fetches analytics using data element codes specified in config `series`', async () => {
      await analyticsPerPeriod({ dataBuilderConfig }, aggregator);
      expect(aggregator.fetchAnalytics).toHaveBeenCalledOnceWith(
        ['CASES', 'POP'],
        expect.anything(),
        undefined,
        expect.anything(),
      );
    });

    it('returns timestamped results using the specified series, sorted by timestamp', async () => {
      const response = await analyticsPerPeriod({ dataBuilderConfig }, aggregator);
      expect(response).toStrictEqual({
        data: [
          { timestamp: TIMESTAMPS['2019-01-01T00:00:00Z'], cases: 10, population: 100 },
          { timestamp: TIMESTAMPS['2020-01-01T00:00:00Z'], cases: 11, population: 110 },
        ],
      });
    });
  });

  describe('non-series config', () => {
    it('fetches analytics using the `dataElementCode` specified in the config', async () => {
      const dataElementCode = 'CASES';
      await analyticsPerPeriod({ dataBuilderConfig: { dataElementCode } }, aggregator);
      expect(aggregator.fetchAnalytics).toHaveBeenCalledOnceWith(
        [dataElementCode],
        expect.anything(),
        undefined,
        expect.anything(),
      );
    });

    it('returns timestamped results using the default series key, sorted by timestamp', async () => {
      const response = await analyticsPerPeriod(
        { dataBuilderConfig: { dataElementCode: 'CASES' } },
        aggregator,
      );
      expect(response).toStrictEqual({
        data: [
          { timestamp: TIMESTAMPS['2019-01-01T00:00:00Z'], value: 10 },
          { timestamp: TIMESTAMPS['2020-01-01T00:00:00Z'], value: 11 },
        ],
      });
    });
  });
});
