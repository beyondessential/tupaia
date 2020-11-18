/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { allValuesAreNumbers, constructIsOneOfType } from '../../validation';

describe('validatorFunctions', () => {
  describe('allValuesAreNumbers', () => {
    it('fails if a not given an object', () => {
      expect(() => allValuesAreNumbers(null)).toThrowError();
    });

    it('fails if a value is not a number', () => {
      expect(() => allValuesAreNumbers({ hi: 'hello' })).toThrowError(
        "Value 'hi' is not a number: 'hello'",
      );
    });

    it('passes if all values are numbers', () => {
      expect(() => allValuesAreNumbers({ hi: 1, hello: 2 })).not.toThrowError();
    });

    it('passes if given an empty object', () => {
      expect(() => allValuesAreNumbers({})).not.toThrowError();
    });
  });

  describe('constructIsOneOfType', () => {
    it('throws if types are not an array', () => {
      expect(() => constructIsOneOfType('string')).toThrow('expects an array');
    });

    it('throws if types are an empty array ', () => {
      expect(() => constructIsOneOfType([])).toThrow('expects at least one type');
    });

    describe('single type - passes', () => {
      const testData = [
        ['array', [1, 2]],
        ['object', { alpha: 1 }],
        ['number', 1],
        ['string', '1'],
        ['boolean', false],
      ];

      it.each(testData)('%s', (type, value) => {
        const validator = constructIsOneOfType([type]);
        expect(() => validator(value)).not.toThrow();
      });
    });

    describe('single type - fails', () => {
      const testData = [
        ['array', { alpha: 1 }],
        ['object', [1, 2]],
        ['number', '1'],
        ['string', 1],
        ['boolean', 'true'],
      ];

      it.each(testData)('%s', (type, value) => {
        const validator = constructIsOneOfType([type]);
        expect(() => validator(value)).toThrow(`Must be one of ${type}`);
      });
    });

    it('multiple types - passes', () => {
      const validator = constructIsOneOfType(['string', 'number', 'array']);
      expect(() => validator(1)).not.toThrow();
      expect(() => validator([1])).not.toThrow();
    });

    it('multiple types - fails', () => {
      const validator = constructIsOneOfType(['string', 'number', 'array']);
      const errorMessage = 'Must be one of string | number | array';
      expect(() => validator({ alpha: 1 })).toThrow(errorMessage);
      expect(() => validator(false)).toThrow(errorMessage);
    });
  });
});
