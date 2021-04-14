/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { adjustFetchOptionsToAggregationList } from '../../../../analytics/aggregateAnalytics/adjustFetchOptionsToAggregationList';

const getOffsetMonthsAgg = offset => ({
  type: 'OFFSET_PERIOD',
  config: { periodType: 'MONTH', offset },
});

describe('adjustFetchOptionsToAggregationList()', () => {
  const fetchOptions = {
    startDate: '2020-01-01',
    endDate: '2020-02-29',
    period: '202001;202002',
  };
  const testData = [
    ['empty aggregation list', [], fetchOptions],
    ['no need for option expansion', ['FINAL_EACH_MONTH'], fetchOptions],
    [
      'options need expansion in the past',
      [getOffsetMonthsAgg(1)],
      { startDate: '2019-12-01', endDate: '2020-01-31', period: '201912;202001' },
    ],
    [
      'options need expansion in the future',
      [getOffsetMonthsAgg(-1)],
      { startDate: '2020-02-01', endDate: '2020-03-31', period: '202002;202003' },
    ],
    [
      'adjustments in the same direction',
      [getOffsetMonthsAgg(-1), 'FINAL_EACH_MONTH', getOffsetMonthsAgg(-2)],
      { startDate: '2020-04-01', endDate: '2020-05-31', period: '202004;202005' },
    ],
    [
      'adjustments in different directions: they cancel each other',
      [getOffsetMonthsAgg(-1), 'FINAL_EACH_MONTH', getOffsetMonthsAgg(1)],
      fetchOptions,
    ],
    [
      'adjustments in different directions: one of them is stronger',
      [getOffsetMonthsAgg(1), 'FINAL_EACH_MONTH', getOffsetMonthsAgg(-3)],
      { startDate: '2020-03-01', endDate: '2020-04-30', period: '202003;202004' },
    ],
  ];

  it.each(testData)('%s', (_, aggregations, adjustedOptions) => {
    if (aggregations.length === 0) {
      expect(adjustFetchOptionsToAggregationList(fetchOptions, aggregations)).toStrictEqual(
        adjustedOptions,
      );
    } else {
      expect(adjustFetchOptionsToAggregationList(fetchOptions, aggregations)).toStrictEqual({
        ...adjustedOptions,
        aggregations,
      });
    }
  });
});
