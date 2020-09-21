/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { allValuesAreNumbers } from '../../validation';

describe('validationFunctions', () => {
  describe('allValuesAreNumbers', () => {
    it('fails if a not given an object', () => {
      expect(() => allValuesAreNumbers(null)).to.throw();
    });

    it('fails if a value is not a number', () => {
      expect(() => allValuesAreNumbers({ hi: 'hello' })).to.throw(
        "Value 'hi' is not a number: 'hello'",
      );
    });

    it('passes if all values are numbers', () => {
      expect(() => allValuesAreNumbers({ hi: 1, hello: 2 })).to.not.throw();
    });

    it('passes if given an empty object', () => {
      expect(() => allValuesAreNumbers({})).to.not.throw();
    });
  });
});
