/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { countDistinct, min, max, removeAt, toArray } from '../array';

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
    ['returns the min among the provided numbers', [2, 1, -2, -10, 3], -10],
    [
      'returns the min (lexicographically) among the provided strings',
      ['beta', 'bet', 'ALPHA', 'alpha', 'alphabet', 'BETA'],
      'alpha',
    ],
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
    ['returns the max among the provided numbers', [2, 1, -2, -10, 3], 3],
    [
      'returns the max (lexicographically) among the provided strings',
      ['beta', 'bet', 'ALPHA', 'alpha', 'alphabet', 'BETA'],
      'BETA',
    ],
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

describe('removeAt', () => {
  describe('throws for invalid index', () => {
    const testData = [
      ['string', '1'],
      ['array', [1, 2]],
      ['negative number', -1],
      ['+Infinity', Number.POSITIVE_INFINITY],
      ['-Infinity', Number.NEGATIVE_INFINITY],
    ];

    it.each(testData)('%s', (_, input) => {
      const array = [];
      const index = input;
      expect(() => removeAt(array, index)).toThrow('not a positive integer');
    });
  });

  describe('removes the item at the specified index', () => {
    const testData = [
      ['empty array', [[], 0], []],
      ['non empty array, remove at start', [['a', 'b', 'c'], 0], ['b', 'c']],
      ['non empty array, remove at middle', [['a', 'b', 'c'], 1], ['a', 'c']],
      [
        'non empty array, remove at middle (multiple elements)',
        [['a', 'b', 'c', 'd'], 1],
        ['a', 'c', 'd'],
      ],
      ['non empty array, remove at end', [['a', 'b', 'c'], 2], ['a', 'b']],
      ['non empty array, out of bounds index', [['a', 'b', 'c'], 3], ['a', 'b', 'c']],
    ];

    it.each(testData)('%s', (_, input, expected) => {
      const [array, index] = input;
      expect(removeAt(array, index)).toStrictEqual(expected);
    });
  });

  it('does not mutate the provided array', () => {
    const array = ['a', 'b'];
    removeAt(array, 1);
    expect(array).toBe(array);
  });
});
