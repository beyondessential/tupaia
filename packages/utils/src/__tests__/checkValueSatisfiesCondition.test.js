import { checkValueSatisfiesCondition } from '../checkValueSatisfiesCondition';

describe('checkAgainstConditions', () => {
  describe('checkValueSatisfiesCondition()', () => {
    it('should throw an error if given an unknown operator', () => {
      expect(() => checkValueSatisfiesCondition('hello', { operator: 'NOT_VALID' })).toThrowError(
        "Unknown operator: 'NOT_VALID'",
      );
    });

    it('should correctly check if a value satisfies a plain condition', () => {
      const testData = [
        ['hello', 'hello', true],
        [0, 0, true],
        [true, true, true],
        [false, false, true],
        [null, null, true],
        ['hello', 'hi', false],
        [0, '', false],
        [true, 1, false],
        // Undefined value never satisfies any condition
        [undefined, undefined, false],
      ];

      testData.forEach(([value, condition, expected]) => {
        expect(checkValueSatisfiesCondition(value, condition)).toBe(expected);
      });
    });

    it('should return true if the condition is "*" unless the value is undefined or ""', () => {
      const testData = [
        ['hello', '*', true],
        [0, '*', true],
        [false, '*', true],
        [null, '*', true],
        ['', '*', false],
        [undefined, '*', false],
      ];

      testData.forEach(([value, condition, expected]) => {
        expect(checkValueSatisfiesCondition(value, condition)).toBe(expected);
      });
    });

    it('should work with basic mathematical conditions', () => {
      const testData = [
        [1, { operator: '=', value: 1 }, true],
        [2, { operator: '=', value: 1 }, false],
        [1, { operator: '<', value: 2 }, true],
        [2, { operator: '<', value: 2 }, false],
        [2, { operator: '>', value: 1 }, true],
        [1, { operator: '>', value: 1 }, false],
        [1, { operator: '>=', value: 1 }, true],
        [0, { operator: '>=', value: 1 }, false],
        [1, { operator: '<=', value: 1 }, true],
        [2, { operator: '<=', value: 1 }, false],
        [1, { operator: '<=', value: 1 }, true],
        [2, { operator: '<=', value: 1 }, false],
      ];

      testData.forEach(([value, condition, expected]) => {
        expect(checkValueSatisfiesCondition(value, condition)).toBe(expected);
      });
    });

    it('should work with range mathematical conditions', () => {
      const testData = [
        [-1, { operator: 'range', value: [1, 2] }, false],
        [1, { operator: 'range', value: [1, 2] }, true],
        [1.5, { operator: 'range', value: [1, 2] }, true],
        [2, { operator: 'range', value: [1, 2] }, true],
        [3, { operator: 'range', value: [1, 2] }, false],
        [-1, { operator: 'rangeExclusive', value: [1, 2] }, false],
        [1, { operator: 'rangeExclusive', value: [1, 2] }, false],
        [1.5, { operator: 'rangeExclusive', value: [1, 2] }, true],
        [2, { operator: 'rangeExclusive', value: [1, 2] }, false],
        [3, { operator: 'rangeExclusive', value: [1, 2] }, false],
      ];

      testData.forEach(([value, condition, expected]) => {
        expect(checkValueSatisfiesCondition(value, condition)).toBe(expected);
      });
    });

    it('should return false with mathematical conditions if the value is ""', () => {
      const testData = [
        ['', { operator: '=', value: 1 }, false],
        ['', { operator: '<', value: 2 }, false],
        ['', { operator: '>', value: 1 }, false],
        ['', { operator: '>=', value: 1 }, false],
        ['', { operator: '<=', value: 1 }, false],
        ['', { operator: '<=', value: 1 }, false],
        ['', { operator: 'range', value: [1, 2] }, false],
        ['', { operator: 'rangeExclusive', value: [1, 2] }, false],
      ];

      testData.forEach(([value, condition, expected]) => {
        expect(checkValueSatisfiesCondition(value, condition)).toBe(expected);
      });
    });

    it('should check "in" correctly', () => {
      const commonConfig = { operator: 'in', value: ['', undefined, null, 'hi', 1, 2] };

      const testData = [
        ['', commonConfig, true],
        [null, commonConfig, true],
        ['hi', commonConfig, true],
        [1, commonConfig, true],
        [3, commonConfig, false],
        [undefined, commonConfig, false],
        ['hello', commonConfig, false],
      ];

      testData.forEach(([value, condition, expected]) => {
        expect(checkValueSatisfiesCondition(value, condition)).toBe(expected);
      });
    });

    it('operator "in" works with strings correctly', () => {
      const myStringConfig = { operator: 'in', value: 'This is my string' };

      const testData = [
        ['', myStringConfig, true],
        ['string', myStringConfig, true],
        [0, myStringConfig, false],
        [undefined, myStringConfig, false],
        ['hello', myStringConfig, false],
      ];

      testData.forEach(([value, condition, expected]) => {
        expect(checkValueSatisfiesCondition(value, condition)).toBe(expected);
      });
    });

    it('operator "regex" works correctly', () => {
      const testData = [
        ['hi five!', { operator: 'regex', value: 'hi' }, true],
        ['hi five!', { operator: 'regex', value: /hi/ }, true],
        ['hi five!', { operator: 'regex', value: '[hgf]i' }, true],
        ['hi five!', { operator: 'regex', value: /[hgf]i/ }, true],
        ['', { operator: 'regex', value: '' }, true],
        ['hi five!', { operator: 'regex', value: 'Hello' }, false],
        ['hi five!', { operator: 'regex', value: 'Hi' }, false],
        [undefined, { operator: 'regex', value: '' }, false],
      ];

      testData.forEach(([value, condition, expected]) => {
        expect(checkValueSatisfiesCondition(value, condition)).toBe(expected);
      });
    });
  });
});
