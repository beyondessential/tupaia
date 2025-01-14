import { countDistinct, min, max, removeAt, toArray, hasIntersection } from '../array';

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

describe('hasIntersection', () => {
  describe('return `true` if at least one item is shared between the inputs', () => {
    const testData = [
      ['one element arrays', [1], [1]],
      ['arrays with exactly one shared element (first element) (i)', [1], [1, 2]],
      ['arrays with exactly one shared element (first element) (ii)', [1, 2], [1, 3]],
      [
        'arrays with exactly one shared element (not first element, same array position)',
        [2, 1],
        [3, 1],
      ],
      ['arrays with exactly one shared element (different array position)', [2, 1], [3, 4, 1, 5]],
      ['arrays with multiple shared elements', [1, 2], [1, 2, 3]],
    ];

    it.each(testData)('%s', (_, input1, input2) => {
      expect(hasIntersection(input1, input2)).toBe(true);
      expect(hasIntersection(input2, input1)).toBe(true);
    });
  });

  describe('return `false` if no item is shared between the inputs', () => {
    const testData = [
      ['both arrays are empty', [], []],
      ['one array is empty, the other not', [], [1]],
      ['no common element (i)', [1], [3, 4]],
      ['no common element (ii)', [1, 2], [3, 4]],
      ['arrays with loosely but not strictly shared element (primitive)', [1], ['1']],
      ['arrays with loosely but not strictly shared element (object)', [{ a: 1 }], [{ a: 1 }]],
    ];

    it.each(testData)('%s', (_, input1, input2) => {
      expect(hasIntersection(input1, input2)).toBe(false);
      expect(hasIntersection(input2, input1)).toBe(false);
    });
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
