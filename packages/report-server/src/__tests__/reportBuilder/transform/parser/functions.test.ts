/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { TransformParser } from '../../../../reportBuilder/transform/parser';

describe('functions', () => {
  describe('basic', () => {
    describe('value', () => {
      it('returns a string when passed to it', () =>
        expect(new TransformParser().evaluate("=value('some string')")).toBe('some string'));

      it('returns a number when passed to it', () =>
        expect(new TransformParser().evaluate('=value(1)')).toBe(1));

      it('returns a boolean when passed to it', () =>
        expect(new TransformParser().evaluate('=value(true)')).toBe(true));
    });

    describe('last', () => {
      it('returns the final value of an array', () =>
        expect(new TransformParser().evaluate("=last(['first', 'last'])")).toBe('last'));

      it('throws an error when not passed an array', () =>
        expect(() => new TransformParser().evaluate('=last(1)')).toThrowError());
    });

    describe('eq', () => {
      it('returns true when equal values are passed', () =>
        expect(new TransformParser().evaluate('=eq(1, 1)')).toBe(true));

      it('returns false when unequal values are passed', () =>
        expect(new TransformParser().evaluate('=eq(1, 2)')).toBe(false));
    });

    describe('notEq', () => {
      it('returns false when equal values are passed', () =>
        expect(new TransformParser().evaluate('=notEq(1, 1)')).toBe(false));

      it('returns true when unequal values are passed', () =>
        expect(new TransformParser().evaluate('=notEq(1, 2)')).toBe(true));
    });

    describe('gt', () => {
      it('returns false when equal values are passed', () =>
        expect(new TransformParser().evaluate('=gt(1, 1)')).toBe(false));

      it('returns true when val1 larger than val2', () =>
        expect(new TransformParser().evaluate('=gt(2, 1)')).toBe(true));

      it('returns false when val1 smaller than val2', () =>
        expect(new TransformParser().evaluate('=gt(1, 2)')).toBe(false));
    });

    describe('exists', () => {
      it('returns false when undefined value is passed', () =>
        expect(new TransformParser().evaluate('=exists(undefined)')).toBe(false));

      it('returns true when not undefined value is passed', () =>
        expect(new TransformParser().evaluate('=exists(0)')).toBe(true));
    });

    describe('notExists', () => {
      it('returns true when undefined value is passed', () =>
        expect(new TransformParser().evaluate('=notExists(undefined)')).toBe(true));

      it('returns false when not undefined value is passed', () =>
        expect(new TransformParser().evaluate('=notExists(0)')).toBe(false));
    });

    describe('length', () => {
      it('returns the length of an input array', () =>
        expect(new TransformParser().evaluate('=length([1, 2, 3])')).toBe(3));
    });
  });

  describe('context', () => {
    describe('orgUnitIdToCode()', () => {
      const context = {
        orgUnits: [
          { id: '1234', code: 'FJ', name: 'Fiji', attributes: {} },
          { id: '5678', code: 'TO', name: 'Tonga', attributes: {} },
        ],
      };

      it('converts given org unit id to code', () => {
        const parser = new TransformParser(undefined, context);
        expect(parser.evaluate("=orgUnitIdToCode('1234')")).toBe('FJ');
      });

      it('returns undefined if the org unit id is not found', () => {
        const parser = new TransformParser(undefined, context);
        expect(parser.evaluate("=orgUnitIdToCode('abcd')")).toBe(undefined);
      });
    });

    describe('orgUnitCodeToName()', () => {
      const context = {
        orgUnits: [
          { id: '1234', code: 'FJ', name: 'Fiji', attributes: {} },
          { id: '5678', code: 'TO', name: 'Tonga', attributes: {} },
        ],
      };

      it('converts given org unit code to name', () => {
        const parser = new TransformParser(undefined, context);
        expect(parser.evaluate("=orgUnitCodeToName('TO')")).toBe('Tonga');
      });

      it('returns undefined if the org unit code is not found', () => {
        const parser = new TransformParser(undefined, context);
        expect(parser.evaluate("=orgUnitCodeToName('WS')")).toBe(undefined);
      });
    });

    describe('dataElementCodeToName()', () => {
      const context = {
        dataElementCodeToName: {
          FijiBCSC93: 'Haloperidol Tablets 5mg',
          FijiBCSC61: 'Benztropine  Injection 2mg/ml',
        },
      };

      it('converts given data element code to name', () => {
        const parser = new TransformParser(undefined, context);
        expect(parser.evaluate("=dataElementCodeToName('FijiBCSC93')")).toBe(
          'Haloperidol Tablets 5mg',
        );
      });

      it('returns undefined if the data element code is not found', () => {
        const parser = new TransformParser(undefined, context);
        expect(parser.evaluate("=dataElementCodeToName('BCD1')")).toBe(undefined);
      });
    });

    describe('orgUnitAttribute()', () => {
      const context = {
        orgUnits: [
          { id: '1234', code: 'FJ', name: 'Fiji', attributes: { x: 1 } },
          { id: '5678', code: 'TO', name: 'Tonga', attributes: { y: 2 } },
        ],
      };

      it('gets attribute of org unit', () => {
        const parser = new TransformParser(undefined, context);
        expect(parser.evaluate("=orgUnitAttribute('FJ', 'x')")).toBe(1);
      });

      it('returns undefined if the attribute is not set', () => {
        const parser = new TransformParser(undefined, context);
        expect(parser.evaluate("=orgUnitAttribute('TO', 'x')")).toBe(undefined);
      });
    });
  });

  describe('utils', () => {
    describe('convertToPeriod', () => {
      it('converts given period to target type', () =>
        expect(new TransformParser().evaluate("=convertToPeriod('20200101', 'WEEK')")).toBe(
          '2020W01',
        ));
    });

    describe('periodToTimestamp', () => {
      it('converts given period to timestamp', () =>
        expect(new TransformParser().evaluate("=periodToTimestamp('20200101')")).toBe(
          1577836800000,
        ));
    });

    describe('periodToDisplayString', () => {
      it('converts given period to display string of type', () =>
        expect(new TransformParser().evaluate("=periodToDisplayString('20200101', 'WEEK')")).toBe(
          '1st Jan 2020',
        ));
    });

    describe('dateStringToPeriod', () => {
      it('converts given date string to period', () =>
        expect(new TransformParser().evaluate("=dateStringToPeriod('2020-02-15', 'WEEK')")).toBe(
          '2020W07',
        ));
    });

    describe('formatAsFractionAndPercentage', () => {
      it('formats values as fraction and percentage', () =>
        expect(new TransformParser().evaluate('=formatAsFractionAndPercentage(1, 10)')).toBe(
          '1/10 = 10%',
        ));

      it('throws error if denominator is 0', () =>
        expect(() => {
          new TransformParser().evaluate('=formatAsFractionAndPercentage(1, 0)');
        }).toThrow());
    });
  });

  describe('math', () => {
    describe('add', () => {
      it('returns first number if second is undefined', () =>
        expect(new TransformParser().evaluate('=1 + undefined')).toBe(1));

      it('returns second number if first is undefined', () =>
        expect(new TransformParser().evaluate('=undefined + 5')).toBe(5));

      it('returns undefined if all values are undefined', () =>
        expect(new TransformParser().evaluate('=undefined + undefined')).toBe(undefined));

      it('returns string if both values are strings', () =>
        expect(new TransformParser().evaluate("='cat' + 'dog'")).toBe('catdog'));

      it('returns string if first value is string and second is number', () =>
        expect(new TransformParser().evaluate("='age ' + 5")).toBe('age 5'));

      it('returns string if first value is number and second is string', () =>
        expect(new TransformParser().evaluate("=5 + ' cats'")).toBe('5 cats'));

      it('returns string if two operations of two numbers and a string', () =>
        expect(new TransformParser().evaluate("=5 + ' cats and ' + 4")).toBe('5 cats and 4'));

      it('returns string if four operations of numbers and strings', () =>
        expect(new TransformParser().evaluate("=5 + ' cats and ' + 4 + ' hello ' + 5")).toBe(
          '5 cats and 4 hello 5',
        ));
    });

    describe('divide', () => {
      it('returns undefined if second number is undefined', () =>
        expect(new TransformParser().evaluate('=1 / undefined')).toBe(undefined));

      it('returns undefined if first number is undefined', () =>
        expect(new TransformParser().evaluate('=undefined / 5')).toBe(undefined));

      it('returns undefined if both numbers are undefined', () =>
        expect(new TransformParser().evaluate('=undefined / undefined')).toBe(undefined));
    });

    describe('sum', () => {
      it('throws error for non-numeric input', () =>
        expect(() => new TransformParser().evaluate("=sum('cat')")).toThrow());

      it('throws error for non-numeric array input', () =>
        expect(() => new TransformParser().evaluate("=sum([1, 'cat'])")).toThrow());

      it('throws error for non-numeric inputs', () =>
        expect(() => new TransformParser().evaluate("=sum(1, 'cat')")).toThrow());

      it('returns undefined if input is undefined', () =>
        expect(new TransformParser().evaluate('=sum(undefined)')).toBe(undefined));

      it('returns undefined if input is array of undefined', () =>
        expect(new TransformParser().evaluate('=sum([undefined, undefined])')).toBe(undefined));

      it('returns undefined if inputs are undefined', () =>
        expect(new TransformParser().evaluate('=sum(undefined, undefined)')).toBe(undefined));

      it('returns sum if input is at least partially defined array', () =>
        expect(new TransformParser().evaluate('=sum([undefined, 1])')).toBe(1));

      it('returns sum if inputs are at least partially defined', () =>
        expect(new TransformParser().evaluate('=sum(undefined, 1)')).toBe(1));

      it('returns input if input is defined', () =>
        expect(new TransformParser().evaluate('=sum(1)')).toBe(1));

      it('returns sum of all defined inputs', () =>
        expect(new TransformParser().evaluate('=sum(1, 2, 3, undefined, 4)')).toBe(10));
    });

    describe('mean', () => {
      it('calculates the average of multiple numerical arguments', () =>
        expect(new TransformParser().evaluate('=mean(2,4,6)')).toBe(4));

      it('calculates the average of numerical arguments, ignoring undefined arguments', () =>
        expect(new TransformParser().evaluate('=mean(2,4,6,undefined)')).toBe(4));

      it('calculates the average of multiple numerical elements within an array', () =>
        expect(new TransformParser().evaluate('=mean([2,4,6])')).toBe(4));

      it('calculates the average of multiple numerical elements within an array, ignoring undefined elements', () =>
        expect(new TransformParser().evaluate('=mean([2,4,6,undefined])')).toBe(4));

      it('returns undefined for single or multiple undefined arguments', () =>
        expect(new TransformParser().evaluate('=mean([undefined,undefined])')).toBe(undefined));

      it('returns a number for one numerical argument', () =>
        expect(new TransformParser().evaluate('=mean(3)')).toBe(3));

      it('returns undefined for one undefined argument', () =>
        expect(new TransformParser().evaluate('=mean(undefined)')).toBe(undefined));

      it('throws an error if there is one string as an argument', () =>
        expect(() => new TransformParser().evaluate("=mean(3,6,'cat')")).toThrow());
    });
  });
});
