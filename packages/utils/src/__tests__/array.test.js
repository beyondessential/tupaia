/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { countDistinct, min, max, toArray } from '../array';

describe('array', () => {
  describe('countDistinct', () => {
    const testData = [
      ['countDistinct', [[]], 0],
      ['single item ', [[0]], 1],
      ['multiple items, same value', [[0]], 1],
      ['multiple items, different values', [[0, 1]], 2],
      ['multiple items, mixed same & different values', [[0, 1, 0, 1, 1, 2]], 3],
      ['function mapper', [[1.1, 2, 1.3], Math.floor], 2],
      [
        'string mapper',
        [
          [
            { age: 18, postcode: '3121', gender: 'female' },
            { age: 18, postcode: '3122', gender: 'male' },
            { age: 18, postcode: '3123', gender: 'female' },
            { age: 18, postcode: '3123', gender: 'female' },
          ],
          'gender',
        ],
        2,
      ],
    ];

    it.each(testData)('%s', (_, [array, mapper], expected) => {
      expect(countDistinct(array, mapper)).toBe(expected);
    });
  });

  describe('min', () => {
    const testData = [
      ['returns the minimum among the provided values (i)', [2, 3, 10], 2],
      ['returns the minimum among the provided values (ii)', [-2, 1, 3, 10], -2],
      ['returns `undefined` for undefined input', undefined, undefined],
      ['returns `undefined` for null input', null, undefined],
      ['returns `undefined` for empty array', [], undefined],
    ];

    it.each(testData)('%s', (_, input, expected) => {
      expect(min(input)).toBe(expected);
    });
  });

  describe('max', () => {
    const testData = [
      ['returns the maximum among the provided values (i)', [2, 3, 10], 10],
      ['returns the maximum among the provided values (ii)', [-20, 1, 3, 10], 10],
      ['returns `undefined` for undefined input', undefined, undefined],
      ['returns `undefined` for null input', null, undefined],
      ['returns `undefined` for empty array', [], undefined],
    ];

    it.each(testData)('%s', (_, input, expected) => {
      expect(max(input)).toBe(expected);
    });
  });

  describe('toArray', () => {
    it('array input', () => {
      expect(toArray(['a'])).toStrictEqual(['a']);
      expect(toArray(['a', 'b', 'c'])).toStrictEqual(['a', 'b', 'c']);
    });

    it('non array input', () => {
      expect(toArray('a')).toStrictEqual(['a']);
      expect(toArray(undefined)).toStrictEqual([undefined]);
    });
  });
});
