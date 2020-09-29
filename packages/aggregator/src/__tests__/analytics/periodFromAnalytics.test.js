/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { periodFromAnalytics } from '../../analytics/periodFromAnalytics';

describe('periodFromAnalytics()', () => {
  const fetchOptions = { period: '20200104;20200105;20200106;20200107' };
  const testData = [
    [
      'should handle empty analytics',
      [
        [[], fetchOptions],
        {
          earliestAvailable: null,
          latestAvailable: null,
          requested: fetchOptions.period,
        },
      ],
    ],
    [
      "should work with 'YYYYMMDD' periodType",
      [
        [
          [
            { period: '20200103', value: 1 },
            { period: '20200104', value: 2 },
            { period: '20200101', value: 3 },
            { period: '20200106', value: 4 },
            { period: '20200105', value: 5 },
          ],
          fetchOptions,
        ],
        {
          earliestAvailable: '20200101',
          latestAvailable: '20200106',
          requested: fetchOptions.period,
        },
      ],
    ],
    [
      'should work with year periodType',
      [
        [
          [
            { period: '2010', value: 5 },
            { period: '2020', value: 1 },
            { period: '2020', value: 2 },
            { period: '2020', value: 3 },
            { period: '2001', value: 4 },
            { period: '2010', value: 5 },
          ],
          fetchOptions,
        ],
        {
          earliestAvailable: '2001',
          latestAvailable: '2020',
          requested: fetchOptions.period,
        },
      ],
    ],
    [
      'should prefer the correct period types amongst analytics',
      [
        [
          [
            { period: '20100405', value: 1 },
            { period: '201005', value: 2 },
            { period: '2010', value: 4 },
            { period: '20100505', value: 3 },
          ],
          fetchOptions,
        ],
        {
          earliestAvailable: '2010',
          latestAvailable: '2010',
          requested: fetchOptions.period,
        },
      ],
    ],
    [
      'should prefer the correct period types amongst analytics across years',
      [
        [
          [
            { period: '20100405', value: 1 },
            { period: '201005', value: 2 },
            { period: '2010', value: 4 },
            { period: '20110101', value: 4 },
            { period: '2010', value: 4 },
            { period: '200706', value: 4 },
            { period: '20100505', value: 3 },
          ],
          fetchOptions,
        ],
        {
          earliestAvailable: '200706',
          latestAvailable: '20110101',
          requested: fetchOptions.period,
        },
      ],
    ],
  ];

  it.each(testData)('%s', (_, [[analytics, fetchOption], expected]) => {
    expect(periodFromAnalytics(analytics, fetchOption)).toStrictEqual(expected);
  });
});
