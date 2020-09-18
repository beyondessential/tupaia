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
  expect(arrayToSort).toEqual(expectedValue);
};

describe('object', () => {
  describe('getKeysSortedByValues', () => {
    it('should sort the keys of an object containing string values', () => {
      expect(
        getKeysSortedByValues({ fourth: 'd', third: 'c', second: 'b' }, { asc: true }),
      ).toEqual(['second', 'third', 'fourth']);
    });

    it('should sort the keys of an object containing numeric string values', () => {
      expect(
        getKeysSortedByValues({ ten: '10', one: '1', two: '2' }, { asc: true }),
      ).toEqual(['one', 'two', 'ten']);
    });

    it('should sort the keys of an object containing number values', () => {
      expect(getKeysSortedByValues({ five: 5, four: 4, one: 1 }, { asc: true })).toEqual([
        'one',
        'four',
        'five',
      ]);
    });

    it('should use DESC direction if configured accordingly', () => {
      expect(getKeysSortedByValues({ one: 1, five: 5, four: 4 }, { asc: false })).toEqual([
        'five',
        'four',
        'one',
      ]);
    });

    it('should default to ASC direction for empty options', () => {
      expect(getKeysSortedByValues({ five: 5, one: 1 }, {})).toEqual(['one', 'five']);
    });

    it('should default to ASC direction for `undefined` options', () => {
      expect(getKeysSortedByValues({ five: 5, one: 1 })).toEqual(['one', 'five']);
    });

    it('should default to ASC direction for `null` options', () => {
      // null
      expect(getKeysSortedByValues({ five: 5, one: 1 })).toEqual(['one', 'five']);
    });
  });

  describe('getSortByKey()', () => {
    it('should return a method that sorts string values', () => {
      const alpha = { name: 'alpha' };
      const beta = { name: 'beta' };
      const alphabet = { name: 'alphabet' };

      const sortByName = getSortByKey('name', { ascending: true });
      assertSortingCorrectness(sortByName, [alpha, alpha], [alpha, alpha]);
      assertSortingCorrectness(sortByName, [alpha, beta], [alpha, beta]);
      assertSortingCorrectness(sortByName, [beta, alpha], [alpha, beta]);
      assertSortingCorrectness(sortByName, [alphabet, alpha], [alpha, alphabet]);
      assertSortingCorrectness(
        sortByName,
        [beta, alpha, alphabet, alpha],
        [alpha, alpha, alphabet, beta],
      );
    });

    it('should return a method that sorts numeric string values', () => {
      const ten = { value: 'a10b' };
      const eleven = { value: 'a11b' };
      const thousand = { value: 'a1000b' };

      const sortByValue = getSortByKey('value', { ascending: true });
      assertSortingCorrectness(sortByValue, [thousand, ten], [ten, thousand]);
      assertSortingCorrectness(sortByValue, [thousand, eleven], [eleven, thousand]);
      assertSortingCorrectness(sortByValue, [thousand, ten, eleven], [ten, eleven, thousand]);
    });

    it('should return a method that sorts number values', () => {
      const one = { value: 1 };
      const two = { value: 2 };
      const ten = { value: 10 };

      const sortByValue = getSortByKey('value', { ascending: true });
      assertSortingCorrectness(sortByValue, [one, one], [one, one]);
      assertSortingCorrectness(sortByValue, [one, two], [one, two]);
      assertSortingCorrectness(sortByValue, [two, one], [one, two]);
      assertSortingCorrectness(sortByValue, [ten, one], [one, ten]);
      assertSortingCorrectness(sortByValue, [ten, one, two, one], [one, one, two, ten]);
    });

    it('should return a method that sorts values in DESC order, if configured accordingly', () => {
      const one = { value: 1 };
      const two = { value: 2 };

      const sortByValue = getSortByKey('value', { ascending: false });
      assertSortingCorrectness(sortByValue, [one, two], [two, one]);
    });

    it('should default to ASC direction for `undefined` options', () => {
      const one = { value: 1 };
      const two = { value: 2 };

      const sortByValue = getSortByKey('value');
      assertSortingCorrectness(sortByValue, [two, one], [one, two]);
    });

    it('should default to ASC direction for `null` options', () => {
      const one = { value: 1 };
      const two = { value: 2 };

      const sortByValue = getSortByKey('value', null);
      assertSortingCorrectness(sortByValue, [two, one], [one, two]);
    });
  });

  describe('reduceToDictionary()', () => {
    it('should accept either an array or a dictionary of objects as input', () => {
      expect(reduceToDictionary([object1, object2], 'id', 'value')).toEqual(reduceToDictionary({ id1: object1, id2: object2 }, 'id', 'value'));
    });

    describe('key mappers', () => {
      it('string', () => {
        const result = reduceToDictionary([object1, object2], 'id', 'value');
        expect(Object.keys(result)).toEqual(['id1', 'id2']);
      });

      it('function', () => {
        const result = reduceToDictionary([object1, object2], object => object.value / 100, 'id');
        expect(Object.keys(result)).toEqual(['0.1', '0.2']);
      });
    });

    describe('value mappers', () => {
      it('string', () => {
        const result = reduceToDictionary([object1, object2], 'id', 'value');
        expect(Object.values(result)).toEqual([10, 20]);
      });

      it('function', () => {
        const result = reduceToDictionary([object1, object2], 'id', object => object.value / 100);
        expect(Object.values(result)).toEqual([0.1, 0.2]);
      });
    });

    it('should combine key and value mappers into an object', () => {
      expect(reduceToDictionary([object1, object2], 'id', 'value')).toEqual({
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

    it('should create an object out of an array of objects', () => {
      expect(flattenToObject([object1, object3])).toEqual(expectedResult);
    });

    it('should create an object out of an object dictionary', () => {
      expect(flattenToObject({ object1, object3 })).toEqual(expectedResult);
    });

    it('should use the last value for key conflicts', () => {
      expect(flattenToObject({ object2, object1, object3 })).toEqual(expectedResult);
      expect(flattenToObject({ object1, object2, object3 })).toEqual({
        id: 'id2',
        value: 20,
        name: 'Fiji',
        code: 'FJ',
      });
    });
  });

  describe('reduceToSet()', () => {
    const expectedResult = new Set(['id1', 'id2']);

    it('should create a set out of an array of objects', () => {
      expect(reduceToSet([object1, object2], 'id')).toEqual(expectedResult);
    });

    it('should create a set out of an object dictionary', () => {
      expect(reduceToSet({ id1: object1, id2: object2 }, 'id')).toEqual(expectedResult);
    });
  });

  describe('mapKeys', () => {
    it('options parameter should be optional', () => {
      expect(mapKeys({}, {})).toBeInstanceOf(Object);
    });

    it('should return a new object with mapped keys', () => {
      const object = { a: 1, b: 2 };
      const mapping = { a: 'alpha', b: 'beta' };

      expect(mapKeys(object, mapping)).toEqual({
        alpha: 1,
        beta: 2,
      });
    });

    it('should not default to existing keys by default', () => {
      const object = { a: 1, b: 2, c: 3 };
      const mapping = { a: 'alpha', c: 'gamma' };
      const expectedResults = { alpha: 1, gamma: 3 };

      expect(mapKeys(object, mapping)).toEqual(expectedResults);
      expect(mapKeys(object, mapping, undefined)).toEqual(expectedResults);
      expect(mapKeys(object, mapping, {})).toEqual(expectedResults);
    });

    it('should support an option to default to existing keys', () => {
      const object = { a: 1, b: 2, c: 3 };
      const mapping = { a: 'alpha', c: 'gamma' };

      expect(mapKeys(object, mapping, { defaultToExistingKeys: true })).toEqual({
        alpha: 1,
        b: 2,
        gamma: 3,
      });
    });

    it('should support an option to not default to existing keys', () => {
      const object = { a: 1, b: 2, c: 3 };
      const mapping = { a: 'alpha', c: 'gamma' };

      expect(mapKeys(object, mapping, { defaultToExistingKeys: false })).toEqual({
        alpha: 1,
        gamma: 3,
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

      expect(mapValues(object, mapping)).toEqual({
        a: 'alpha',
        b: 'beta',
      });
    });

    it('should not default to existing values by default', () => {
      const object = { a: 1, b: 2, c: 3 };
      const mapping = { 1: 'alpha', 3: 'gamma' };
      const expectedResults = { a: 'alpha', c: 'gamma' };

      expect(mapValues(object, mapping)).toEqual(expectedResults);
      expect(mapValues(object, mapping, {})).toEqual(expectedResults);
    });

    it('should support an option to default to existing values', () => {
      const object = { a: 1, b: 2, c: 3 };
      const mapping = { 1: 'alpha', 3: 'gamma' };

      expect(mapValues(object, mapping, { defaultToExistingValues: true })).toEqual({
        a: 'alpha',
        b: 2,
        c: 'gamma',
      });
    });

    it('should support an option to not default to existing values', () => {
      const object = { a: 1, b: 2, c: 3 };
      const mapping = { 1: 'alpha', 3: 'gamma' };

      expect(mapValues(object, mapping, { defaultToExistingValues: false })).toEqual({
        a: 'alpha',
        c: 'gamma',
      });
    });
  });
});
