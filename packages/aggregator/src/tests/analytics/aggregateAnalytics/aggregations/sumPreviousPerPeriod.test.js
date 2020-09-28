/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { PERIOD_TYPES } from '@tupaia/utils';
import { sumPreviousPerPeriod } from '../../../../analytics/aggregateAnalytics/aggregations';

const { DAY } = PERIOD_TYPES;
const { YEAR } = PERIOD_TYPES;

describe('sumPreviousPerPeriod()', () => {
  const testData = [
    [
      'should sum across periods',
      [
        [
          [
            { dataElement: 1, organisationUnit: 1, period: '20200101', value: 1 },
            { dataElement: 1, organisationUnit: 1, period: '20200102', value: 2 },
            { dataElement: 1, organisationUnit: 1, period: '20200103', value: 3 },
          ],
          {},
          DAY,
        ],
        [
          { dataElement: 1, organisationUnit: 1, period: '20200101', value: 1 },
          { dataElement: 1, organisationUnit: 1, period: '20200102', value: 3 },
          { dataElement: 1, organisationUnit: 1, period: '20200103', value: 6 },
        ],
      ],
    ],
    [
      'should combine by org unit and data element',
      [
        [
          [
            { dataElement: 1, organisationUnit: 1, period: '20200101', value: 1 },
            { dataElement: 2, organisationUnit: 1, period: '20200101', value: 2 },
            { dataElement: 1, organisationUnit: 2, period: '20200101', value: 3 },
            { dataElement: 2, organisationUnit: 2, period: '20200101', value: 4 },
            //
            { dataElement: 1, organisationUnit: 1, period: '20200102', value: 5 },
            { dataElement: 2, organisationUnit: 1, period: '20200102', value: 6 },
            { dataElement: 1, organisationUnit: 2, period: '20200102', value: 7 },
            { dataElement: 2, organisationUnit: 2, period: '20200102', value: 8 },
          ],
          {},
          DAY,
        ],
        [
          { dataElement: 1, organisationUnit: 1, period: '20200101', value: 1 },
          { dataElement: 2, organisationUnit: 1, period: '20200101', value: 2 },
          { dataElement: 1, organisationUnit: 2, period: '20200101', value: 3 },
          { dataElement: 2, organisationUnit: 2, period: '20200101', value: 4 },
          //
          { dataElement: 1, organisationUnit: 1, period: '20200102', value: 6 },
          { dataElement: 2, organisationUnit: 1, period: '20200102', value: 8 },
          { dataElement: 1, organisationUnit: 2, period: '20200102', value: 10 },
          { dataElement: 2, organisationUnit: 2, period: '20200102', value: 12 },
        ],
      ],
    ],
    [
      'should sum with missing analytics',
      [
        [
          [
            { dataElement: 1, organisationUnit: 1, period: '20200101', value: 1 },
            // { dataElement: 1, organisationUnit: 1, period: '20200102', value: 2 },
            { dataElement: 1, organisationUnit: 1, period: '20200103', value: 3 },
          ],
          {},
          DAY,
        ],
        [
          { dataElement: 1, organisationUnit: 1, period: '20200101', value: 1 },
          { dataElement: 1, organisationUnit: 1, period: '20200102', value: 1 },
          { dataElement: 1, organisationUnit: 1, period: '20200103', value: 4 },
        ],
      ],
    ],
    ['should sum with no analytics', [[[], {}, DAY], []]],
    [
      'should only return results within requestedPeriod if oldest request period > oldest data',
      [
        [
          [
            { dataElement: 1, organisationUnit: 1, period: '20200101', value: 1 },
            { dataElement: 1, organisationUnit: 1, period: '20200102', value: 2 },
            { dataElement: 1, organisationUnit: 1, period: '20200103', value: 3 },
          ],
          { requestedPeriod: '20200102;20200103;20200104' },
          DAY,
        ],
        [
          { dataElement: 1, organisationUnit: 1, period: '20200102', value: 3 },
          { dataElement: 1, organisationUnit: 1, period: '20200103', value: 6 },
        ],
      ],
    ],
    [
      'should only return results within requestedPeriod if latest request period < newest data',
      [
        [
          [
            { dataElement: 1, organisationUnit: 1, period: '20200101', value: 1 },
            { dataElement: 1, organisationUnit: 1, period: '20200102', value: 2 },
            { dataElement: 1, organisationUnit: 1, period: '20200103', value: 3 },
          ],
          { requestedPeriod: '20191231;20200101;20200102' },
          DAY,
        ],
        [
          { dataElement: 1, organisationUnit: 1, period: '20200101', value: 1 },
          { dataElement: 1, organisationUnit: 1, period: '20200102', value: 3 },
        ],
      ],
    ],
    [
      'should work if there is no data for the first period',
      [
        [
          [
            { dataElement: 1, organisationUnit: 1, period: '20200101', value: 1 },
            // { dataElement: 1, organisationUnit: 1, period: '20200102', value: 2 },
            { dataElement: 1, organisationUnit: 1, period: '20200103', value: 3 },
          ],
          { requestedPeriod: '20200102;20200103' },
          DAY,
        ],
        [
          { dataElement: 1, organisationUnit: 1, period: '20200102', value: 1 },
          { dataElement: 1, organisationUnit: 1, period: '20200103', value: 4 },
        ],
      ],
    ],
    [
      'should do everything with a different period type',
      [
        [
          [
            { dataElement: 1, organisationUnit: 1, period: '2017', value: 1 },
            { dataElement: 2, organisationUnit: 1, period: '2017', value: 2 },
            //
            { dataElement: 1, organisationUnit: 1, period: '2018', value: 3 },
            { dataElement: 1, organisationUnit: 2, period: '2018', value: 4 },
            //
            { dataElement: 1, organisationUnit: 1, period: '2019', value: 5 },
            //
            { dataElement: 1, organisationUnit: 1, period: '2020', value: 6 },
            { dataElement: 1, organisationUnit: 2, period: '2020', value: 7 },
            { dataElement: 2, organisationUnit: 1, period: '2020', value: 8 },
          ],
          { requestedPeriod: '2019;2020;2021;2022' },
          YEAR,
        ],
        [
          { dataElement: 1, organisationUnit: 1, period: '2019', value: 9 },
          { dataElement: 2, organisationUnit: 1, period: '2019', value: 2 },
          { dataElement: 1, organisationUnit: 2, period: '2019', value: 4 },
          //
          { dataElement: 1, organisationUnit: 1, period: '2020', value: 15 },
          { dataElement: 2, organisationUnit: 1, period: '2020', value: 10 },
          { dataElement: 1, organisationUnit: 2, period: '2020', value: 11 },
        ],
      ],
    ],
  ];

  it.each(testData)('%s', (_, [[analytics, config, period], expected]) => {
    expect(sumPreviousPerPeriod(analytics, config, period)).toEqual(
      expect.arrayContaining(expected),
    );
  });
});
