import { filterAnalytics } from '../../analytics/filterAnalytics';

const analytics = [{ value: 1 }, { value: 2 }, { value: 3 }];

describe('filterAnalytics()', () => {
  describe('empty filter', () => {
    const testData = [
      ['empty array', []],
      ['undefined', [undefined]],
      ['empty object', [{}]],
    ];

    it.each(testData)('%s', (_, [filter]) => {
      expect(() => filterAnalytics(analytics, filter)).not.toThrow();
    });
  });

  describe('filter type', () => {
    describe('single type', () => {
      const testData = [
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
      ];

      it.each(testData)('%s', (_, testCaseData) => {
        testCaseData.forEach(([filter, expected]) => {
          expect(filterAnalytics(analytics, filter)).toStrictEqual(expected);
        });
      });
    });

    describe('combines multiple types using AND logic', () => {
      const testData = [
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
      ];

      it.each(testData)('%s', (_, testCaseData) => {
        testCaseData.forEach(([filter, expected]) => {
          expect(filterAnalytics(analytics, filter)).toStrictEqual(expected);
        });
      });
    });
  });
});
