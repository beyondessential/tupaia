/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  flattenToObject,
  getKeysSortedByValues,
  mapKeys,
  mapValues,
  reduceToDictionary,
  reduceToSet,
  getSortByKey,
} from '../object';

describe('object', () => {
  describe('getKeysSortedByValues', () => {
    const testData = [
      [
        'should sort the keys of an object containing string values',
        [{ fourth: 'd', third: 'c', second: 'b' }, { asc: true }],
        ['second', 'third', 'fourth'],
      ],
      [
        'should sort the keys of an object containing numeric string values',
        [{ ten: '10', one: '1', two: '2' }, { asc: true }],
        ['one', 'two', 'ten'],
      ],
      [
        'should sort the keys of an object containing number values',
        [{ five: 5, four: 4, one: 1 }, { asc: true }],
        ['one', 'four', 'five'],
      ],
      [
        'should use DESC direction if configured accordingly',
        [{ one: 1, five: 5, four: 4 }, { asc: false }],
        ['five', 'four', 'one'],
      ],
      [
        'should default to ASC direction for empty options',
        [{ five: 5, one: 1 }, {}],
        ['one', 'five'],
      ],
      [
        'should default to ASC direction for `undefined` options',
        [{ five: 5, one: 1 }, undefined],
        ['one', 'five'],
      ],
      [
        'should default to ASC direction for `null` options',
        [{ five: 5, one: 1 }, null],
        ['one', 'five'],
      ],
    ];

    it.each(testData)('%s', (_, [object, options], expected) => {
      expect(getKeysSortedByValues(object, options)).toStrictEqual(expected);
    });
  });

  describe('getSortByKey()', () => {
    const assertSortingCorrectness = (sortingMethod, input, expectedValue) => {
      const arrayToSort = [...input];
      arrayToSort.sort(sortingMethod);
      expect(arrayToSort).toStrictEqual(expectedValue);
    };

    it('should return a method that sorts string values', () => {
      const alpha = { name: 'alpha' };
      const beta = { name: 'beta' };
      const alphabet = { name: 'alphabet' };
      const sortByName = getSortByKey('name', { ascending: true });

      const testData = [
        [
          [alpha, alpha],
          [alpha, alpha],
        ],
        [
          [alpha, beta],
          [alpha, beta],
        ],
        [
          [beta, alpha],
          [alpha, beta],
        ],
        [
          [alphabet, alpha],
          [alpha, alphabet],
        ],
        [
          [beta, alpha, alphabet, alpha],
          [alpha, alpha, alphabet, beta],
        ],
      ];

      testData.forEach(([input, expected]) => {
        assertSortingCorrectness(sortByName, input, expected);
      });
    });

    it('should return a method that sorts numeric string values', () => {
      const ten = { value: 'a10b' };
      const eleven = { value: 'a11b' };
      const thousand = { value: 'a1000b' };
      const sortByValue = getSortByKey('value', { ascending: true });

      const testData = [
        [
          [thousand, ten],
          [ten, thousand],
        ],
        [
          [thousand, eleven],
          [eleven, thousand],
        ],
        [
          [thousand, ten, eleven],
          [ten, eleven, thousand],
        ],
      ];

      testData.forEach(([input, expected]) => {
        assertSortingCorrectness(sortByValue, input, expected);
      });
    });

    it('should return a method that sorts number values', () => {
      const one = { value: 1 };
      const two = { value: 2 };
      const ten = { value: 10 };
      const sortByValue = getSortByKey('value', { ascending: true });

      const testData = [
        [
          [one, one],
          [one, one],
        ],
        [
          [one, two],
          [one, two],
        ],
        [
          [two, one],
          [one, two],
        ],
        [
          [ten, one],
          [one, ten],
        ],
        [
          [ten, one, two, one],
          [one, one, two, ten],
        ],
      ];

      testData.forEach(([input, expected]) => {
        assertSortingCorrectness(sortByValue, input, expected);
      });
    });

    const one = { value: 1 };
    const two = { value: 2 };

    it('should return a method that sorts values in DESC order, if configured accordingly', () => {
      const sortByValue = getSortByKey('value', { ascending: false });
      assertSortingCorrectness(sortByValue, [one, two], [two, one]);
    });

    it('should default to ASC direction for `undefined` options', () => {
      const sortByValue = getSortByKey('value');
      assertSortingCorrectness(sortByValue, [two, one], [one, two]);
    });

    it('should default to ASC direction for `null` options', () => {
      const sortByValue = getSortByKey('value', null);
      assertSortingCorrectness(sortByValue, [two, one], [one, two]);
    });
  });

  describe('reduceToDictionary()', () => {
    const object1 = { id: 'id1', value: 10 };
    const object2 = { id: 'id2', value: 20 };

    it('should accept either an array or a dictionary of objects as input', () => {
      expect(reduceToDictionary([object1, object2], 'id', 'value')).toStrictEqual(
        reduceToDictionary({ id1: object1, id2: object2 }, 'id', 'value'),
      );
    });

    describe('key mappers', () => {
      it('string', () => {
        const result = reduceToDictionary([object1, object2], 'id', 'value');
        expect(Object.keys(result)).toStrictEqual(['id1', 'id2']);
      });

      it('function', () => {
        const result = reduceToDictionary([object1, object2], object => object.value / 100, 'id');
        expect(Object.keys(result)).toStrictEqual(['0.1', '0.2']);
      });
    });

    describe('value mappers', () => {
      it('string', () => {
        const result = reduceToDictionary([object1, object2], 'id', 'value');
        expect(Object.values(result)).toStrictEqual([10, 20]);
      });

      it('function', () => {
        const result = reduceToDictionary([object1, object2], 'id', object => object.value / 100);
        expect(Object.values(result)).toStrictEqual([0.1, 0.2]);
      });
    });

    it('should combine key and value mappers into an object', () => {
      expect(reduceToDictionary([object1, object2], 'id', 'value')).toStrictEqual({
        id1: 10,
        id2: 20,
      });
    });
  });

  describe('flattenToObject()', () => {
    const object1 = { id: 'id1', value: 10 };
    const object2 = { id: 'id2', value: 20 };
    const object3 = { name: 'Fiji', code: 'FJ' };

    const testData = [
      [
        'should create an object out of an array of objects',
        [object1, object3],
        { id: 'id1', value: 10, name: 'Fiji', code: 'FJ' },
      ],
      [
        'should create an object out of an object dictionary',
        { object1, object3 },
        { id: 'id1', value: 10, name: 'Fiji', code: 'FJ' },
      ],
      [
        'should use the last value for key conflicts (i)',
        { object2, object1, object3 },
        { id: 'id1', value: 10, name: 'Fiji', code: 'FJ' },
      ],
      [
        'should use the last value for key conflicts (ii)',
        { object1, object2, object3 },
        {
          id: 'id2',
          value: 20,
          name: 'Fiji',
          code: 'FJ',
        },
      ],
    ];

    it.each(testData)('%s', (_, objectCollection, expected) => {
      expect(flattenToObject(objectCollection)).toStrictEqual(expected);
    });
  });

  describe('reduceToSet()', () => {
    const object1 = { id: 'id1', value: 10 };
    const object2 = { id: 'id2', value: 20 };
    const expectedResult = new Set(['id1', 'id2']);

    it('should create a set out of an array of objects', () => {
      expect(reduceToSet([object1, object2], 'id')).toStrictEqual(expectedResult);
    });

    it('should create a set out of an object dictionary', () => {
      expect(reduceToSet({ id1: object1, id2: object2 }, 'id')).toStrictEqual(expectedResult);
    });
  });

  describe('mapKeys', () => {
    it('options parameter should be optional', () => {
      expect(mapKeys({}, {})).toBeInstanceOf(Object);
    });

    it('should return a new object with mapped keys', () => {
      const object = { a: 1, b: 2 };
      const mapping = { a: 'alpha', b: 'beta' };

      expect(mapKeys(object, mapping)).toStrictEqual({
        alpha: 1,
        beta: 2,
      });
    });

    describe('`defaultToExistingKeys` option', () => {
      const object = { a: 1, b: 2, c: 3 };
      const mapping = { a: 'alpha', c: 'gamma' };

      const testData = [
        [
          'should support an option to default to existing keys',
          { defaultToExistingKeys: true },
          { alpha: 1, b: 2, gamma: 3 },
        ],
        [
          'should support an option to not default to existing keys',
          { defaultToExistingKeys: false },
          { alpha: 1, gamma: 3 },
        ],
        [
          'should not default to existing keys for undefined options',
          undefined,
          { alpha: 1, gamma: 3 },
        ],
        ['should not default to existing keys for empty options', {}, { alpha: 1, gamma: 3 }],
      ];

      it.each(testData)('%s', (_, options, expected) => {
        expect(mapKeys(object, mapping, options)).toStrictEqual(expected);
      });
    });
  });

  describe('mapValues', () => {
    it('options parameter should be optional', () => {
      expect(mapKeys({}, {})).toBeInstanceOf(Object);
    });

    it('should return a new object with mapped values', () => {
      const object = { a: 1, b: 2 };
      const mapping = { 1: 'alpha', 2: 'beta' };

      expect(mapValues(object, mapping)).toStrictEqual({
        a: 'alpha',
        b: 'beta',
      });
    });

    describe('`defaultToExistingKeys` option', () => {
      const object = { a: 1, b: 2, c: 3 };
      const mapping = { 1: 'alpha', 3: 'gamma' };

      const testData = [
        [
          'should support an option to default to existing values',
          { defaultToExistingValues: true },
          { a: 'alpha', b: 2, c: 'gamma' },
        ],
        [
          'should support an option to not default to existing values',
          { defaultToExistingValues: false },
          { a: 'alpha', c: 'gamma' },
        ],
        [
          'should not default to existing values for undefined options',
          undefined,
          { a: 'alpha', c: 'gamma' },
        ],
        ['should not default to existing values for empty options', {}, { a: 'alpha', c: 'gamma' }],
      ];

      it.each(testData)('%s', (_, options, expected) => {
        expect(mapValues(object, mapping, options)).toStrictEqual(expected);
      });
    });
  });
});
