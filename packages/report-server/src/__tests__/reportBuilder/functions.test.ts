/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { functions } from '../../reportBuilder/functions';

describe('functions', () => {
  describe('basic', () => {
    describe('value', () => {
      it('returns a string when passed to it', () =>
        expect(functions.value('some string')).toBe('some string'));

      it('returns a number when passed to it', () => expect(functions.value(1)).toBe(1));

      it('returns a boolean when passed to it', () => expect(functions.value(true)).toBe(true));
    });

    describe('last', () => {
      it('returns the final value of an array', () =>
        expect(functions.last(['first', 'last'])).toBe('last'));

      it('throws an error when not passed an array', () =>
        expect(() => functions.last(1)).toThrowError());
    });

    describe('eq', () => {
      it('returns true when equal values are passed', () => expect(functions.eq(1, 1)).toBe(true));

      it('returns false when unequal values are passed', () =>
        expect(functions.eq(1, 2)).toBe(false));
    });
  });
});
