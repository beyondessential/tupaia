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

const object1 = {
  id: 'id1',
  value: 10,
};
const object2 = {
  id: 'id2',
  value: 20,
};
const object3 = {
  name: 'Fiji',
  code: 'FJ',
};

const assertSortingCorrectness = (sortingMethod, input, expectedValue) => {
  const arrayToSort = [...input];
  arrayToSort.sort(sortingMethod);
  expect(arrayToSort).toStrictEqual(expectedValue);
};

describe('object', () => {
  describe('getKeysSortedByValues', () => {
    it.each([
      [
        'should sort the keys of an object containing string values',
        { fourth: 'd', third: 'c', second: 'b' },
        { asc: true },
        ['second', 'third', 'fourth'],
      ],
      [
        'should sort the keys of an object containing numeric string values',
        { ten: '10', one: '1', two: '2' },
        { asc: true },
        ['one', 'two', 'ten'],
      ],
      [
        'should sort the keys of an object containing number values',
        { five: 5, four: 4, one: 1 },
        { asc: true },
        ['one', 'four', 'five'],
      ],
      [
        'should use DESC direction if configured accordingly',
        { one: 1, five: 5, four: 4 },
        { asc: false },
        ['five', 'four', 'one'],
      ],
      [
        'should default to ASC direction for empty options',
        { five: 5, one: 1 },
        {},
        ['one', 'five'],
      ],
    ])('%s', (name, object, options, expected) => {
      expect(getKeysSortedByValues(object, options)).toStrictEqual(expected);
    });

    it.each([
      [
        'should default to ASC direction for `undefined` options',
        { five: 5, one: 1 },
        ['one', 'five'],
      ],
      ['should default to ASC direction for `null` options', { five: 5, one: 1 }, ['one', 'five']],
    ])('%s', (name, object, expected) => {
      expect(getKeysSortedByValues(object)).toStrictEqual(expected);
    });
  });

  describe('getSortByKey()', () => {
    describe('should return a method that sorts string values', () => {
      const alpha = { name: 'alpha' };
      const beta = { name: 'beta' };
      const alphabet = { name: 'alphabet' };
      const sortByName = getSortByKey('name', { ascending: true });

      it.each([
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
      ])('check sorted string values', (input, expected) => {
        assertSortingCorrectness(sortByName, input, expected);
      });
    });

    describe('should return a method that sorts numeric string values', () => {
      const ten = { value: 'a10b' };
      const eleven = { value: 'a11b' };
      const thousand = { value: 'a1000b' };
      const sortByValue = getSortByKey('value', { ascending: true });

      it.each([
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
      ])('check sorted numeric values', (input, expected) => {
        assertSortingCorrectness(sortByValue, input, expected);
      });
    });

    describe('should return a method that sorts number values', () => {
      const one = { value: 1 };
      const two = { value: 2 };
      const ten = { value: 10 };
      const sortByValue = getSortByKey('value', { ascending: true });

      it.each([
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
      ])('check sorted number values', (input, expected) => {
        assertSortingCorrectness(sortByValue, input, expected);
      });
    });

    describe('should return a method that sorts numbers values with descending orders ', () => {
      const one = { value: 1 };
      const two = { value: 2 };
      it.each(
        [
          [
            'should return a method that sorts values in DESC order, if configured accordingly',
            getSortByKey('value', { ascending: false }),
            [one, two],
            [two, one],
          ],
          [
            'should default to ASC direction for `undefined` options',
            getSortByKey('value'),
            [two, one],
            [one, two],
          ],
          [
            'should default to ASC direction for `null` options',
            getSortByKey('value', null),
            [two, one],
            [one, two],
          ],
        ],
        ('%s',
        (name, sortByValue, input, expected) => {
          assertSortingCorrectness(sortByValue, input, expected);
        }),
      );
    });
  });

  describe('reduceToDictionary()', () => {
    it('should accept either an array or a dictionary of objects as input', () => {
      expect(reduceToDictionary([object1, object2], 'id', 'value')).toStrictEqual(
        reduceToDictionary({ id1: object1, id2: object2 }, 'id', 'value'),
      );
    });

    describe('key mappers', () => {
      it.each([
        ['string', [object1, object2], 'id', 'value', ['id1', 'id2']],
        ['function', [object1, object2], object => object.value / 100, 'id', ['0.1', '0.2']],
      ])('%s', (name, objectCollection, keyMapper, valueMapper, expected) => {
        const result = reduceToDictionary(objectCollection, keyMapper, valueMapper);
        expect(Object.keys(result)).toStrictEqual(expected);
      });
    });

    describe('value mappers', () => {
      it.each([
        ['string', [object1, object2], 'id', 'value', [10, 20]],
        ['function', [object1, object2], 'id', object => object.value / 100, [0.1, 0.2]],
      ])('%s', (name, objectCollection, keyMapper, valueMapper, expected) => {
        const result = reduceToDictionary(objectCollection, keyMapper, valueMapper);
        expect(Object.values(result)).toStrictEqual(expected);
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
    const expectedResult = {
      id: 'id1',
      value: 10,
      name: 'Fiji',
      code: 'FJ',
    };

    it.each([
      ['should create an object out of an array of objects', [object1, object3], expectedResult],
      ['should create an object out of an object dictionary', { object1, object3 }, expectedResult],
      [
        'should use the last value for key conflicts',
        { object2, object1, object3 },
        expectedResult,
      ],
      [
        'should use the last value for key conflicts',
        { object1, object2, object3 },
        {
          id: 'id2',
          value: 20,
          name: 'Fiji',
          code: 'FJ',
        },
      ],
    ])('%s', (name, objectCollection, expected) => {
      expect(flattenToObject(objectCollection)).toStrictEqual(expected);
    });
  });

  describe('reduceToSet()', () => {
    const expectedResult = new Set(['id1', 'id2']);
    it.each([
      ['should create a set out of an array of objects', [object1, object2], 'id', expectedResult],
      [
        'should create a set out of an object dictionary',
        { id1: object1, id2: object2 },
        'id',
        expectedResult,
      ],
    ])('%s', (name, objectCollection, property, expected) => {
      expect(reduceToSet(objectCollection, property)).toStrictEqual(expected);
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

    describe('check option and default to existing keys', () => {
      const object = { a: 1, b: 2, c: 3 };
      const mapping = { a: 'alpha', c: 'gamma' };
      it.each([
        [
          'should support an option to default to existing keys',
          object,
          mapping,
          { defaultToExistingKeys: true },
          { alpha: 1, b: 2, gamma: 3 },
        ],
        [
          'should support an option to not default to existing keys',
          object,
          mapping,
          { defaultToExistingKeys: false },
          { alpha: 1, gamma: 3 },
        ],
        [
          'should not default to existing keys by default',
          object,
          mapping,
          undefined,
          { alpha: 1, gamma: 3 },
        ],
        [
          'should not default to existing keys by default',
          object,
          mapping,
          {},
          { alpha: 1, gamma: 3 },
        ],
      ])('%s', (name, objectInput, mappingInput, option, expected) => {
        expect(mapKeys(objectInput, mappingInput, option)).toStrictEqual(expected);
      });

      it('should not default to existing keys by default', () => {
        expect(mapKeys(object, mapping)).toStrictEqual({ alpha: 1, gamma: 3 });
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

    describe('check default and option', () => {
      const object = { a: 1, b: 2, c: 3 };
      const mapping = { 1: 'alpha', 3: 'gamma' };

      it('should not default to existing values by default', () => {
        expect(mapValues(object, mapping)).toStrictEqual({ a: 'alpha', c: 'gamma' });
      });

      it.each([
        [
          'should not default to existing values by default',
          object,
          mapping,
          {},
          { a: 'alpha', c: 'gamma' },
        ],
        [
          'should support an option to default to existing values',
          object,
          mapping,
          { defaultToExistingValues: true },
          { a: 'alpha', b: 2, c: 'gamma' },
        ],
        [
          'should support an option to not default to existing values',
          object,
          mapping,
          { defaultToExistingValues: false },
          { a: 'alpha', c: 'gamma' },
        ],
      ])('%s', (name, objectInput, mappingInput, option, expected) => {
        expect(mapValues(objectInput, mappingInput, option)).toStrictEqual(expected);
      });
    });

    it('should not default to existing values by default', () => {
      const object = { a: 1, b: 2, c: 3 };
      const mapping = { 1: 'alpha', 3: 'gamma' };
      const expectedResults = { a: 'alpha', c: 'gamma' };

      expect(mapValues(object, mapping)).toStrictEqual(expectedResults);
      expect(mapValues(object, mapping, {})).toStrictEqual(expectedResults);
    });

    it('should support an option to default to existing values', () => {
      const object = { a: 1, b: 2, c: 3 };
      const mapping = { 1: 'alpha', 3: 'gamma' };

      expect(mapValues(object, mapping, { defaultToExistingValues: true })).toStrictEqual({
        a: 'alpha',
        b: 2,
        c: 'gamma',
      });
    });

    it('should support an option to not default to existing values', () => {
      const object = { a: 1, b: 2, c: 3 };
      const mapping = { 1: 'alpha', 3: 'gamma' };

      expect(mapValues(object, mapping, { defaultToExistingValues: false })).toStrictEqual({
        a: 'alpha',
        c: 'gamma',
      });
    });
  });
});
