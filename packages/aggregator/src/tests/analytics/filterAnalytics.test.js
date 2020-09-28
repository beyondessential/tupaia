/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { filterAnalytics } from '../../analytics/filterAnalytics';

const analytics = [{ value: 1 }, { value: 2 }, { value: 3 }];

describe('filterAnalytics()', () => {
  describe('empty filter', () => {
    const testData = [
      ['i', []],
      ['ii', [undefined]],
      ['iii', [{}]],
    ];
    it.each(testData)('%s', (_, [filter]) => {
      expect(() => filterAnalytics(analytics, filter)).not.toThrow();
    });
  });

  describe('filter type', () => {
    const testData = [
      [
        'single type',
        [
          [
            '=',
            [
              [{ value: 2 }, [{ value: 2 }]],
              [{ value: 4 }, []],
              [{ value: { '=': 2 } }, [{ value: 2 }]],
              [{ value: { '=': 2 } }, filterAnalytics(analytics, { value: 2 })],
            ],
          ],
          [
            '>',
            [
              [{ value: { '>': 2 } }, [{ value: 3 }]],
              [{ value: { '>': 4 } }, []],
            ],
          ],
          [
            '>=',
            [
              [{ value: { '>=': 2 } }, [{ value: 2 }, { value: 3 }]],
              [{ value: { '>=': 4 } }, []],
            ],
          ],
          [
            '<',
            [
              [{ value: { '>=': 2 } }, [{ value: 2 }, { value: 3 }]],
              [{ value: { '>=': 4 } }, []],
            ],
          ],
          [
            '<=',
            [
              [{ value: { '<=': 2 } }, [{ value: 1 }, { value: 2 }]],
              [{ value: { '<=': 0 } }, []],
            ],
          ],
        ],
      ],
      [
        'combines multiple types using AND logic',
        [
          [
            'one type superset of the other',
            [
              [{ value: { '<=': 2, '=': 2 } }, [{ value: 2 }]],
              [{ value: { '=': 2, '<=': 2 } }, [{ value: 2 }]],
            ],
          ],
          [
            'mutually exclusive types',
            [
              [{ value: { '=': 2, '<': 2 } }, []],
              [{ value: { '<': 2, '=': 2 } }, []],
            ],
          ],
          [
            'known and unknown types',
            [
              [{ value: { '=': 2, unknownFilter: 3 } }, [{ value: 2 }]],
              [{ value: { '=': 2, unknownFilter: 3 } }, [{ value: 2 }]],
            ],
          ],
          [
            'unknown types',
            [
              [
                { value: { operator: 'unknownFilter', value: 0 } },
                [{ value: 1 }, { value: 2 }, { value: 3 }],
              ],
            ],
          ],
        ],
      ],
    ];
    testData.forEach(([name, testSuites]) => {
      describe(name, () => {
        it.each(testSuites)('%s', (_, testCaseData) => {
          testCaseData.forEach(([filter, expected]) => {
            expect(filterAnalytics(analytics, filter)).toStrictEqual(expected);
          });
        });
      });
    });
  });
});
