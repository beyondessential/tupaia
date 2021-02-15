/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ArithmeticBuilder } from '../../../Builder/ArithmeticBuilder/ArithmeticBuilder';
import { AggregationListsMap, DbRecord } from '../../../types';

export const getAggregationListsMap = () => {
  const testData: [string, DbRecord, AggregationListsMap][] = [
    [
      'single aggregation - string',
      {
        formula: 'BCD1 + BCD2',
        aggregation: 'FINAL_EACH_WEEK',
      },
      {
        BCD1: [[{ type: 'FINAL_EACH_WEEK' }]],
        BCD2: [[{ type: 'FINAL_EACH_WEEK' }]],
      },
    ],
    [
      'single aggregation - object without config',
      {
        formula: 'BCD1 + BCD2',
        aggregation: { type: 'FINAL_EACH_WEEK' },
      },
      {
        BCD1: [[{ type: 'FINAL_EACH_WEEK' }]],
        BCD2: [[{ type: 'FINAL_EACH_WEEK' }]],
      },
    ],
    [
      'single aggregation - object with config',
      {
        formula: 'BCD1 + BCD2',
        aggregation: { type: 'SUM_UNTIL_CURRENT_DAY', config: { periodType: 'month' } },
      },
      {
        BCD1: [[{ type: 'SUM_UNTIL_CURRENT_DAY', config: { periodType: 'month' } }]],
        BCD2: [[{ type: 'SUM_UNTIL_CURRENT_DAY', config: { periodType: 'month' } }]],
      },
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
      {
        BCD1: [
          [
            { type: 'MOST_RECENT' },
            { type: 'FINAL_EACH_WEEK' },
            { type: 'SUM_UNTIL_CURRENT_DAY', config: { periodType: 'month' } },
          ],
        ],
        BCD2: [
          [
            { type: 'MOST_RECENT' },
            { type: 'FINAL_EACH_WEEK' },
            { type: 'SUM_UNTIL_CURRENT_DAY', config: { periodType: 'month' } },
          ],
        ],
      },
    ],
    [
      'multiple aggregations',
      {
        formula: 'BCD1 + BCD2 + BCD3 + BCD4',
        aggregation: {
          BCD1: 'OFFSET_PERIOD',
          BCD2: { type: 'OFFSET_PERIOD', config: { periodType: 'week', offset: 1 } },
          BCD3: ['FINAL_EACH_WEEK', 'SUM'],
          BCD4: [
            { type: 'FINAL_EACH_WEEK' },
            'SUM',
            { type: 'OFFSET_PERIOD', config: { periodType: 'week', offset: 1 } },
          ],
        },
      },
      {
        BCD1: [[{ type: 'OFFSET_PERIOD' }]],
        BCD2: [[{ type: 'OFFSET_PERIOD', config: { periodType: 'week', offset: 1 } }]],
        BCD3: [[{ type: 'FINAL_EACH_WEEK' }, { type: 'SUM' }]],
        BCD4: [
          [
            { type: 'FINAL_EACH_WEEK' },
            { type: 'SUM' },
            { type: 'OFFSET_PERIOD', config: { periodType: 'week', offset: 1 } },
          ],
        ],
      },
    ],
  ];

  it.each(testData)('%s', (_, config, expected) => {
    const indicator = { code: 'test', builder: 'arithmetic', config };
    const builder = new ArithmeticBuilder(indicator);
    return expect(builder.getAggregationListsMap()).toStrictEqual(expected);
  });
};
