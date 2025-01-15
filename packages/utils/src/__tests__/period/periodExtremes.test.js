import { getMostAncientPeriod, getMostRecentPeriod } from '../../period/periodExtremes';

describe('periodExtremes', () => {
  describe('getMostRecentPeriod()', () => {
    const testData = [
      ['should return null for empty input', undefined, null],
      [
        'should return null if there are no valid periods in the input',
        ['NOT_A_PERIOD', 'NOT_ONE_EITHER'],
        null,
      ],
      [
        'should return the most recent valid period',
        ['NOT_VALID', '2020W12', 'NEITHER_IS_THIS'],
        '2020W12',
      ],
      ['should return the most recent period', ['20191202', '20200104', '20200201'], '20200201'],
      [
        'should return the most recent period with different period types',
        ['2020', '2020W12', '20200102'],
        '2020W12',
      ],
      [
        'should return the least coarse recent period with different period types',
        ['2020', '2020W01', '20200101'],
        '20200101',
      ],
    ];

    it.each(testData)('%s', (_, periods, expected) => {
      expect(getMostRecentPeriod(periods)).toBe(expected);
    });
  });

  describe('getMostAncientPeriod()', () => {
    const testData = [
      ['should return null for empty input', undefined, null],
      [
        'should return null if there are no valid periods in the input',
        ['NOT_A_PERIOD', 'NOT_ONE_EITHER'],
        null,
      ],
      [
        'should return the most ancient valid period',
        ['NOT_VALID', '2020W12', 'NEITHER_IS_THIS'],
        '2020W12',
      ],
      ['should return the most ancient period', ['20191202', '20200104', '20200201'], '20191202'],
      [
        'should return the most recent ancient with different period types',
        ['2020', '2020W12', '20200102'],
        '2020',
      ],
      [
        'should return the most recent ancient with different period types',
        ['2020', '2020W12', '20200102'],
        '2020',
      ],
      [
        'should return the least coarse recent ancient with different period types',
        ['2020', '2020Q1', '20200101'],
        '20200101',
      ],
    ];

    it.each(testData)('%s', (_, periods, expected) => {
      expect(getMostAncientPeriod(periods)).toBe(expected);
    });
  });
});
