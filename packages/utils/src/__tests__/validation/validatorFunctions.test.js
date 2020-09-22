/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { allValuesAreNumbers } from '../../validation';

describe('validationFunctions', () => {
  describe('allValuesAreNumbers', () => {
    it.each([
      ['fails if a not given an object', null, ''],
      ['fails if a value is not a number', { hi: 'hello' }, "Value 'hi' is not a number: 'hello'"],
    ])('%s', (_, object, expectedError) => {
      expect(() => allValuesAreNumbers(object)).toThrowError(expectedError);
    });

    it.each([
      ['passes if all values are numbers', { hi: 1, hello: 2 }],
      ['passes if given an empty object', {}],
    ])('%s', (_, object) => {
      expect(() => allValuesAreNumbers(object)).not.toThrowError();
    });
  });
});
