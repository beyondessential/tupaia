import { checkValueSatisfiesCondition } from '../checkValueSatisfiesCondition';

describe('checkAgainstConditions', () => {
  describe('checkValueSatisfiesCondition()', () => {
    it('should throw an error if given an unknown operator', () => {
      expect(() => checkValueSatisfiesCondition('hello', { operator: 'NOT_VALID' })).toThrowError("Unknown operator: 'NOT_VALID'");
    });

    it('should correctly check if a value satisfies a plain condition', () => {
      expect(checkValueSatisfiesCondition('hello', 'hello')).toBe(true);
      expect(checkValueSatisfiesCondition(0, 0)).toBe(true);
      expect(checkValueSatisfiesCondition(true, true)).toBe(true);
      expect(checkValueSatisfiesCondition(false, false)).toBe(true);
      expect(checkValueSatisfiesCondition(null, null)).toBe(true);

      expect(checkValueSatisfiesCondition('hello', 'hi')).toBe(false);
      expect(checkValueSatisfiesCondition(0, '')).toBe(false);
      expect(checkValueSatisfiesCondition(true, 1)).toBe(false);

      // Undefined value never satisfies any condition
      expect(checkValueSatisfiesCondition(undefined, undefined)).toBe(false);
    });

    it('should return true if the condition is "*" unless the value is undefined or ""', () => {
      expect(checkValueSatisfiesCondition('hello', '*')).toBe(true);
      expect(checkValueSatisfiesCondition(0, '*')).toBe(true);
      expect(checkValueSatisfiesCondition(false, '*')).toBe(true);
      expect(checkValueSatisfiesCondition(null, '*')).toBe(true);

      expect(checkValueSatisfiesCondition('', '*')).toBe(false);
      expect(checkValueSatisfiesCondition(undefined, '*')).toBe(false);
    });

    it('should work with basic mathematical conditions', () => {
      expect(checkValueSatisfiesCondition(1, { operator: '=', value: 1 })).toBe(true);
      expect(checkValueSatisfiesCondition(2, { operator: '=', value: 1 })).toBe(false);

      expect(checkValueSatisfiesCondition(1, { operator: '<', value: 2 })).toBe(true);
      expect(checkValueSatisfiesCondition(2, { operator: '<', value: 2 })).toBe(false);

      expect(checkValueSatisfiesCondition(2, { operator: '>', value: 1 })).toBe(true);
      expect(checkValueSatisfiesCondition(1, { operator: '>', value: 1 })).toBe(false);

      expect(checkValueSatisfiesCondition(1, { operator: '>=', value: 1 })).toBe(true);
      expect(checkValueSatisfiesCondition(0, { operator: '>=', value: 1 })).toBe(false);

      expect(checkValueSatisfiesCondition(1, { operator: '<=', value: 1 })).toBe(true);
      expect(checkValueSatisfiesCondition(2, { operator: '<=', value: 1 })).toBe(false);

      expect(checkValueSatisfiesCondition(1, { operator: '<=', value: 1 })).toBe(true);
      expect(checkValueSatisfiesCondition(2, { operator: '<=', value: 1 })).toBe(false);
    });

    it('should work with range mathematical conditions', () => {
      expect(checkValueSatisfiesCondition(-1, { operator: 'range', value: [1, 2] })).toBe(false);
      expect(checkValueSatisfiesCondition(1, { operator: 'range', value: [1, 2] })).toBe(true);
      expect(checkValueSatisfiesCondition(1.5, { operator: 'range', value: [1, 2] })).toBe(true);
      expect(checkValueSatisfiesCondition(2, { operator: 'range', value: [1, 2] })).toBe(true);
      expect(checkValueSatisfiesCondition(3, { operator: 'range', value: [1, 2] })).toBe(false);

      expect(checkValueSatisfiesCondition(-1, { operator: 'rangeExclusive', value: [1, 2] })).toBe(false);
      expect(checkValueSatisfiesCondition(1, { operator: 'rangeExclusive', value: [1, 2] })).toBe(false);
      expect(checkValueSatisfiesCondition(1.5, { operator: 'rangeExclusive', value: [1, 2] })).toBe(true);
      expect(checkValueSatisfiesCondition(2, { operator: 'rangeExclusive', value: [1, 2] })).toBe(false);
      expect(checkValueSatisfiesCondition(3, { operator: 'rangeExclusive', value: [1, 2] })).toBe(false);
    });

    it('should return false with mathematical conditions if the value is ""', () => {
      expect(checkValueSatisfiesCondition('', { operator: '=', value: 1 })).toBe(false);
      expect(checkValueSatisfiesCondition('', { operator: '<', value: 2 })).toBe(false);
      expect(checkValueSatisfiesCondition('', { operator: '>', value: 1 })).toBe(false);
      expect(checkValueSatisfiesCondition('', { operator: '>=', value: 1 })).toBe(false);
      expect(checkValueSatisfiesCondition('', { operator: '<=', value: 1 })).toBe(false);
      expect(checkValueSatisfiesCondition('', { operator: '<=', value: 1 })).toBe(false);
      expect(checkValueSatisfiesCondition('', { operator: 'range', value: [1, 2] })).toBe(false);
      expect(checkValueSatisfiesCondition('', { operator: 'rangeExclusive', value: [1, 2] })).toBe(false);
    });

    it('should check "in" correctly', () => {
      const commonConfig = { operator: 'in', value: ['', undefined, null, 'hi', 1, 2] };
      expect(checkValueSatisfiesCondition('', commonConfig)).toBe(true);
      expect(checkValueSatisfiesCondition(null, commonConfig)).toBe(true);
      expect(checkValueSatisfiesCondition('hi', commonConfig)).toBe(true);
      expect(checkValueSatisfiesCondition(1, commonConfig)).toBe(true);
      expect(checkValueSatisfiesCondition(3, commonConfig)).toBe(false);
      expect(checkValueSatisfiesCondition(undefined, commonConfig)).toBe(false);
      expect(checkValueSatisfiesCondition('hello', commonConfig)).toBe(false);
    });

    it('operator "in" works with strings correctly', () => {
      const commonConfig = { operator: 'in', value: 'This is my string' };
      expect(checkValueSatisfiesCondition('', commonConfig)).toBe(true);
      expect(checkValueSatisfiesCondition('string', commonConfig)).toBe(true);
      expect(checkValueSatisfiesCondition(0, commonConfig)).toBe(false);
      expect(checkValueSatisfiesCondition(undefined, commonConfig)).toBe(false);
      expect(checkValueSatisfiesCondition('hello', commonConfig)).toBe(false);
    });

    it('operator "regex" works correctly', () => {
      expect(checkValueSatisfiesCondition('hi five!', { operator: 'regex', value: 'hi' })).toBe(true);
      expect(checkValueSatisfiesCondition('hi five!', { operator: 'regex', value: /hi/ })).toBe(true);
      expect(checkValueSatisfiesCondition('hi five!', { operator: 'regex', value: '[hgf]i' })).toBe(true);
      expect(checkValueSatisfiesCondition('hi five!', { operator: 'regex', value: /[hgf]i/ })).toBe(true);
      expect(checkValueSatisfiesCondition('', { operator: 'regex', value: '' })).toBe(true);

      expect(checkValueSatisfiesCondition('hi five!', { operator: 'regex', value: 'Hello' })).toBe(false);
      expect(checkValueSatisfiesCondition('hi five!', { operator: 'regex', value: 'Hi' })).toBe(false);
      expect(checkValueSatisfiesCondition(undefined, { operator: 'regex', value: '' })).toBe(false);
    });
  });
});
