/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ArithmeticConfig, buildArithmetic } from '../../../builders/buildArithmetic';
import { Aggregation } from '../../../types';
import { createAggregator } from '../stubs';

export const testDataFetching = () => {
  describe('calls `aggregator.fetchAnalytics` with correct element codes and aggregations', () => {
    const aggregator = createAggregator();
    const api = {
      getAggregator: () => aggregator,
      buildAnalyticsForIndicators: async () => [],
    };

    type FetchAnalyticsParams = { codes: string[]; aggregations: Aggregation[] };

    const testData: [string, ArithmeticConfig, FetchAnalyticsParams[]][] = [
      [
        'single aggregation - string',
        {
          formula: 'BCD1 + BCD2',
          aggregation: 'FINAL_EACH_WEEK',
        },
        [{ codes: ['BCD1', 'BCD2'], aggregations: [{ type: 'FINAL_EACH_WEEK' }] }],
      ],
      [
        'single aggregation - object without config',
        {
          formula: 'BCD1 + BCD2',
          aggregation: { type: 'FINAL_EACH_WEEK' },
        },
        [{ codes: ['BCD1', 'BCD2'], aggregations: [{ type: 'FINAL_EACH_WEEK' }] }],
      ],
      [
        'single aggregation - object with config',
        {
          formula: 'BCD1 + BCD2',
          aggregation: { type: 'SUM_UNTIL_CURRENT_DAY', config: { periodType: 'month' } },
        },
        [
          {
            codes: ['BCD1', 'BCD2'],
            aggregations: [{ type: 'SUM_UNTIL_CURRENT_DAY', config: { periodType: 'month' } }],
          },
        ],
      ],
      [
        'single aggregation - array',
        {
          formula: 'BCD1 + BCD2',
          aggregation: [
            'MOST_RECENT',
            { type: 'FINAL_EACH_WEEK' },
            { type: 'SUM_UNTIL_CURRENT_DAY', config: { periodType: 'month' } },
          ],
        },
        [
          {
            codes: ['BCD1', 'BCD2'],
            aggregations: [
              { type: 'MOST_RECENT' },
              { type: 'FINAL_EACH_WEEK' },
              { type: 'SUM_UNTIL_CURRENT_DAY', config: { periodType: 'month' } },
            ],
          },
        ],
      ],
      [
        'multiple aggregations - strings',
        {
          formula: 'BCD1 + BCD2',
          aggregation: { BCD1: 'FINAL_EACH_WEEK', BCD2: 'SUM' },
        },
        [
          { codes: ['BCD1'], aggregations: [{ type: 'FINAL_EACH_WEEK' }] },
          { codes: ['BCD2'], aggregations: [{ type: 'SUM' }] },
        ],
      ],
      [
        'multiple aggregations - multiple types',
        {
          formula: 'BCD1 + BCD1a + BCD2 + BCD3 + BCD4 + BCD4a + BCD5 + BCD6',
          aggregation: {
            BCD1: 'MOST_RECENT',
            BCD1a: { type: 'MOST_RECENT' },
            BCD2: 'SUM',
            BCD3: { type: 'SUM', config: { periodType: 'week', offset: 1 } },

            BCD4: ['FINAL_EACH_WEEK', 'SUM'],
            BCD4a: [{ type: 'FINAL_EACH_WEEK' }, { type: 'SUM' }],
            BCD5: ['FINAL_EACH_WEEK', 'COUNT'],

            BCD6: [
              { type: 'FINAL_EACH_WEEK' },
              'SUM',
              { type: 'OFFSET_PERIOD', config: { periodType: 'week', offset: 1 } },
            ],
          },
        },
        [
          { codes: ['BCD1', 'BCD1a'], aggregations: [{ type: 'MOST_RECENT' }] },
          { codes: ['BCD2'], aggregations: [{ type: 'SUM' }] },
          {
            codes: ['BCD3'],
            aggregations: [{ type: 'SUM', config: { periodType: 'week', offset: 1 } }],
          },
          {
            codes: ['BCD4', 'BCD4a'],
            aggregations: [{ type: 'FINAL_EACH_WEEK' }, { type: 'SUM' }],
          },
          {
            codes: ['BCD5'],
            aggregations: [{ type: 'FINAL_EACH_WEEK' }, { type: 'COUNT' }],
          },
          {
            codes: ['BCD6'],
            aggregations: [
              { type: 'FINAL_EACH_WEEK' },
              { type: 'SUM' },
              { type: 'OFFSET_PERIOD', config: { periodType: 'week', offset: 1 } },
            ],
          },
        ],
      ],
    ];

    it.each(testData)('%s', async (_, config, expectedCallArgs) => {
      await buildArithmetic({ api, config, fetchOptions: {} });

      expect(aggregator.fetchAnalytics).toHaveBeenCalledTimes(expectedCallArgs.length);
      expectedCallArgs.forEach(({ codes, aggregations }) => {
        expect(aggregator.fetchAnalytics).toHaveBeenCalledWith(codes, expect.anything(), {
          aggregations,
        });
      });
    });
  });

  it('calls `aggregator.fetchAnalytics` with `fetchOptions`', async () => {
    const aggregator = createAggregator();
    const api = {
      getAggregator: () => aggregator,
      buildAnalyticsForIndicators: async () => [],
    };
    const config = {
      formula: 'A + B',
      aggregation: { A: 'MOST_RECENT', B: 'MOST_RECENT' },
    };
    const fetchOptions = { organisationUnitCodes: ['TO'] };
    await buildArithmetic({ api, config, fetchOptions });

    expect(aggregator.fetchAnalytics).toHaveBeenCalledOnceWith(
      expect.anything(),
      fetchOptions,
      expect.anything(),
    );
  });
};
