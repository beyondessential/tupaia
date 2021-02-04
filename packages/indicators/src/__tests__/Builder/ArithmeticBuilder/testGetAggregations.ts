/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ArithmeticBuilder } from '../../../Builder/ArithmeticBuilder/ArithmeticBuilder';
import { Aggregation, DbRecord } from '../../../types';

export const testGetAggregations = () => {
  const testData: [string, DbRecord, Aggregation[]][] = [
    [
      'single aggregation - string',
      {
        formula: 'BCD1 + BCD2',
        aggregation: 'FINAL_EACH_WEEK',
      },
      [{ type: 'FINAL_EACH_WEEK' }],
    ],
    [
      'single aggregation - object without config',
      {
        formula: 'BCD1 + BCD2',
        aggregation: { type: 'FINAL_EACH_WEEK' },
      },
      [{ type: 'FINAL_EACH_WEEK' }],
    ],
    [
      'single aggregation - object with config',
      {
        formula: 'BCD1 + BCD2',
        aggregation: { type: 'SUM_UNTIL_CURRENT_DAY', config: { periodType: 'month' } },
      },
      [{ type: 'SUM_UNTIL_CURRENT_DAY', config: { periodType: 'month' } }],
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
        { type: 'FINAL_EACH_WEEK' },
        { type: 'MOST_RECENT' },
        { type: 'SUM_UNTIL_CURRENT_DAY', config: { periodType: 'month' } },
      ],
    ],
    [
      'multiple aggregations - strings',
      {
        formula: 'BCD1 + BCD2',
        aggregation: { BCD1: 'FINAL_EACH_WEEK', BCD2: 'SUM' },
      },
      [{ type: 'FINAL_EACH_WEEK' }, { type: 'SUM' }],
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
        { type: 'COUNT' },
        { type: 'FINAL_EACH_WEEK' },
        { type: 'MOST_RECENT' },
        { type: 'OFFSET_PERIOD', config: { periodType: 'week', offset: 1 } },
        { type: 'SUM' },
        { type: 'SUM', config: { periodType: 'week', offset: 1 } },
      ],
    ],
  ];

  it.each(testData)('%s', (_, config, expected) => {
    const indicator = { code: 'test', builder: 'arithmetic', config };
    const builder = new ArithmeticBuilder(indicator);
    return expect(builder.getAggregations()).toIncludeSameMembers(expected);
  });
};
