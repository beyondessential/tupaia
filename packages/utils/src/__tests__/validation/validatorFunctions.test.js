/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { allValuesAreNumbers } from '../../validation';

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
});
