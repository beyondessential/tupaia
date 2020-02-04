/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import {
  flattenToObject,
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
  expect(arrayToSort).to.deep.equal(expectedValue);
};

describe('object', () => {
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
    const expectedResult = {
      id1: 10,
      id2: 20,
    };

    it('should create a dictionary out of an array of objects', () => {
      expect(reduceToDictionary([object1, object2], 'id', 'value')).to.deep.equal(expectedResult);
    });

    it('should create a dictionary out of an object dictionary', () => {
      expect(reduceToDictionary({ id1: object1, id2: object2 }, 'id', 'value')).to.deep.equal(
        expectedResult,
      );
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
      expect(flattenToObject([object1, object3])).to.deep.equal(expectedResult);
    });

    it('should create an object out of an object dictionary', () => {
      expect(flattenToObject({ object1, object3 })).to.deep.equal(expectedResult);
    });

    it('should use the last value for key conflicts', () => {
      expect(flattenToObject({ object2, object1, object3 })).to.deep.equal(expectedResult);
      expect(flattenToObject({ object1, object2, object3 })).to.deep.equal({
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
      expect(reduceToSet([object1, object2], 'id')).to.deep.equal(expectedResult);
    });

    it('should create a set out of an object dictionary', () => {
      expect(reduceToSet({ id1: object1, id2: object2 }, 'id')).to.deep.equal(expectedResult);
    });
  });

  describe('mapKeys', () => {
    it('should return a new object with mapped keys', () => {
      const object = { a: 1, b: 2 };
      const mapping = { a: 'alpha', b: 'beta' };

      expect(mapKeys(object, mapping)).to.deep.equal({
        alpha: 1,
        beta: 2,
      });
    });

    it('should not default to existing keys by default', () => {
      const object = { a: 1, b: 2, c: 3 };
      const mapping = { a: 'alpha', c: 'gamma' };

      expect(mapKeys(object, mapping)).to.deep.equal(mapKeys(object, mapping, false));
    });

    it('should be able to default to existing keys', () => {
      const object = { a: 1, b: 2, c: 3 };
      const mapping = { a: 'alpha', c: 'gamma' };

      expect(mapKeys(object, mapping, true)).to.deep.equal({
        alpha: 1,
        b: 2,
        gamma: 3,
      });
    });

    it('should be able to not default to existing keys ', () => {
      const object = { a: 1, b: 2, c: 3 };
      const mapping = { a: 'alpha', c: 'gamma' };

      expect(mapKeys(object, mapping, false)).to.deep.equal({
        alpha: 1,
        gamma: 3,
      });
    });
  });

  describe('mapValues', () => {
    it('should return a new object with mapped values', () => {
      const object = { a: 1, b: 2 };
      const mapping = { 1: 'alpha', 2: 'beta' };

      expect(mapValues(object, mapping)).to.deep.equal({
        a: 'alpha',
        b: 'beta',
      });
    });

    it('should not default to existing values by default', () => {
      const object = { a: 1, b: 2, c: 3 };
      const mapping = { 1: 'alpha', 3: 'gamma' };

      expect(mapValues(object, mapping)).to.deep.equal(mapValues(object, mapping, false));
    });

    it('should be able to default to existing values', () => {
      const object = { a: 1, b: 2, c: 3 };
      const mapping = { 1: 'alpha', 3: 'gamma' };

      expect(mapValues(object, mapping, true)).to.deep.equal({
        a: 'alpha',
        b: 2,
        c: 'gamma',
      });
    });

    it('should be able to not default to existing keys ', () => {
      const object = { a: 1, b: 2, c: 3 };
      const mapping = { 1: 'alpha', 3: 'gamma' };

      expect(mapValues(object, mapping, false)).to.deep.equal({
        a: 'alpha',
        c: 'gamma',
      });
    });
  });
});
