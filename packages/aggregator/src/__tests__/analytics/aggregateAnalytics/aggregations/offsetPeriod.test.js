/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { arrayToAnalytics } from '@tupaia/data-broker';
import { offsetPeriod } from '../../../../analytics/aggregateAnalytics/aggregations/offsetPeriod';

describe('offsetPeriod()', () => {
  it('throws an error if `periodType` is not provided', () => {
    expect(() => offsetPeriod([], { offset: 1 })).toThrow("'periodType' is required");
  });

  it('throws an error if `offset` is not provided', () => {
    expect(() => offsetPeriod([], { periodType: 'day' })).toThrow("'offset' is required");
  });

  it('`periodType` is case insensitive', () => {
    const analytics = [
      { dataElement: 'BCD1', organisationUnit: 'TO', period: '20190101', value: 1 },
    ];
    const offset = 1;

    const resultsForLowerPeriodType = offsetPeriod(analytics, { periodType: 'year', offset });
    const resultsForUpperPeriodType = offsetPeriod(analytics, { periodType: 'YEAR', offset });
    expect(resultsForLowerPeriodType).toStrictEqual(resultsForUpperPeriodType);
  });

  describe('adds the specified offset to every analytic', () => {
    const analytics = arrayToAnalytics([
      ['BCD1', 'TO', '20170101', 1],
      ['BCD2', 'TO', '20190505', 2],
      ['BCD1', 'PG', '20301231', 3],
    ]);
    const periodType = 'year';
    const testData = [
      [
        -2,
        [
          ['BCD1', 'TO', '20150101', 1],
          ['BCD2', 'TO', '20170505', 2],
          ['BCD1', 'PG', '20281231', 3],
        ],
      ],
      [
        -1,
        [
          ['BCD1', 'TO', '20160101', 1],
          ['BCD2', 'TO', '20180505', 2],
          ['BCD1', 'PG', '20291231', 3],
        ],
      ],
      [
        0,
        [
          ['BCD1', 'TO', '20170101', 1],
          ['BCD2', 'TO', '20190505', 2],
          ['BCD1', 'PG', '20301231', 3],
        ],
      ],
      [
        +1,
        [
          ['BCD1', 'TO', '20180101', 1],
          ['BCD2', 'TO', '20200505', 2],
          ['BCD1', 'PG', '20311231', 3],
        ],
      ],
      [
        +2,
        [
          ['BCD1', 'TO', '20190101', 1],
          ['BCD2', 'TO', '20210505', 2],
          ['BCD1', 'PG', '20321231', 3],
        ],
      ],
    ];

    it.each(testData)('%s', (offset, expected) => {
      const expectedAnalytics = arrayToAnalytics(expected);
      expect(offsetPeriod(analytics, { periodType, offset })).toStrictEqual(expectedAnalytics);
    });
  });

  describe('supports multiple period types', () => {
    const testData = [
      [
        'year',
        {
          periodType: 'year',
          previous: '20190102',
          next: '20200102',
        },
      ],
      [
        'quarter',
        {
          periodType: 'quarter',
          previous: '20190202',
          next: '20190502',
        },
      ],
      [
        'month',
        {
          periodType: 'month',
          previous: '20191231',
          next: '20200131',
        },
      ],

      [
        'week',
        {
          periodType: 'week',
          previous: '20190102',
          next: '20190109',
        },
      ],
      [
        'day',
        {
          periodType: 'day',
          previous: '20191231',
          next: '20200101',
        },
      ],
      [
        'day - leap year',
        {
          periodType: 'day',
          previous: '20200229',
          next: '20200301',
        },
      ],
    ];

    const createAnalytic = period => ({
      dataElement: 'BCD1',
      organisationUnit: 'TO',
      period,
      value: 1,
    });

    const assertPeriodOffsetIsApplied = (inputPeriod, aggregationConfig, expectedPeriod) => {
      const analytics = [createAnalytic(inputPeriod)];
      const expected = [createAnalytic(expectedPeriod)];
      expect(offsetPeriod(analytics, aggregationConfig)).toStrictEqual(expected);
    };

    it.each(testData)('%s', (_, { periodType, previous, next }) => {
      assertPeriodOffsetIsApplied(previous, { periodType, offset: +1 }, next);
      assertPeriodOffsetIsApplied(next, { periodType, offset: -1 }, previous);
    });

    it('month - different total days between months', () => {
      const periodType = 'month';
      // This is an edge case where applying a - offset is not a reversible with a + offset
      assertPeriodOffsetIsApplied('20190531', { periodType, offset: -1 }, '20190430');
      assertPeriodOffsetIsApplied('20190430', { periodType, offset: +1 }, '20190530');
    });
  });
});
