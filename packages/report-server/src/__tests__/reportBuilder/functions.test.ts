/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { matrix } from 'mathjs';

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

    describe('notEq', () => {
      it('returns false when equal values are passed', () =>
        expect(functions.notEq(1, 1)).toBe(false));

      it('returns true when unequal values are passed', () =>
        expect(functions.notEq(1, 2)).toBe(true));
    });

    describe('gt', () => {
      it('returns false when equal values are passed', () =>
        expect(functions.gt(1, 1)).toBe(false));

      it('returns true when val1 larger than val2', () => expect(functions.gt(2, 1)).toBe(true));

      it('returns false when val1 smaller than val2', () => expect(functions.gt(1, 2)).toBe(false));
    });

    describe('exists', () => {
      it('returns false when undefined value is passed', () =>
        expect(functions.exists(undefined)).toBe(false));

      it('returns true when not undefined value is passed', () =>
        expect(functions.exists(0)).toBe(true));
    });

    describe('notExists', () => {
      it('returns true when undefined value is passed', () =>
        expect(functions.notExists(undefined)).toBe(true));

      it('returns false when not undefined value is passed', () =>
        expect(functions.notExists(0)).toBe(false));
    });

    describe('length', () => {
      it('returns the length of an input array', () => expect(functions.length([1, 2, 3])).toBe(3));
    });
  });

  describe('utils', () => {
    describe('convertToPeriod', () => {
      it('converts given period to target type', () =>
        expect(functions.convertToPeriod('20200101', 'WEEK')).toBe('2020W01'));
    });

    describe('periodToTimestamp', () => {
      it('converts given period to timestamp', () =>
        expect(functions.periodToTimestamp('20200101')).toBe(1577836800000));
    });

    describe('periodToDisplayString', () => {
      it('converts given period to display string of type', () =>
        expect(functions.periodToDisplayString('20200101', 'WEEK')).toBe('1st Jan 2020'));
    });

    describe('dateStringToPeriod', () => {
      it('converts given date string to period', () =>
        expect(functions.dateStringToPeriod('2020-02-15', 'WEEK')).toBe('2020W07'));
    });

    describe('formatAsFractionAndPercentage', () => {
      it('formats values as fraction and percentage', () =>
        expect(functions.formatAsFractionAndPercentage(1, 10)).toBe('1/10 = 10%'));

      it('throws error if denominator is 0', () =>
        expect(() => {
          functions.formatAsFractionAndPercentage(1, 0);
        }).toThrow());
    });
  });

  describe('math', () => {
    describe('sum', () => {
      it('sums a list of numbers', () => expect(functions.sum(1, 2, 3)).toBe(6));

      it('ignores undefined values', () => expect(functions.sum(1, undefined, 3)).toBe(4));

      it('can sum an array', () => expect(functions.sum([1, 2, 3])).toBe(6));

      it('ignores undefined within an array', () =>
        expect(functions.sum([1, undefined, 3])).toBe(4));

      it('can combine numbers and arrays', () =>
        expect(functions.sum([1, undefined, 3], undefined, 2)).toBe(6));

      it('returns undefined if all values are undefined', () =>
        expect(functions.sum([undefined, undefined, undefined], undefined, undefined)).toBe(
          undefined,
        ));

      it('throws an error if input is a mathjs matrix', () =>
        expect(() => functions.sum(matrix([1, 2, 3]))).toThrow('sum received invalid input type'));

      it('throws an error if input is non-numeric', () =>
        expect(() => functions.sum([1, 2, 3], 'cat')).toThrow('sum received invalid input type'));
    });

    describe('divide', () => {
      it('divides a list of numbers', () => expect(functions.divide(12, 3, 2)).toBe(2));

      it('returns undefined if any number is undefined', () =>
        expect(functions.divide(12, undefined, 2)).toBe(undefined));

      it('can divide an array', () => expect(functions.divide([12, 2, 3])).toBe(2));

      it('can combine numbers and arrays', () => expect(functions.divide([100, 2], 10, 1)).toBe(5));

      it('throws an error if input is a mathjs matrix', () =>
        expect(() => functions.divide(matrix([1, 2, 3]))).toThrow(
          'divide received invalid input type',
        ));

      it('throws an error if input is non-numeric', () =>
        expect(() => functions.divide([1, 2, 3], 'cat')).toThrow(
          'divide received invalid input type',
        ));
    });
  });
});
