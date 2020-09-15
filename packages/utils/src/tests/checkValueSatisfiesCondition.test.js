import { expect } from 'chai';
import { checkValueSatisfiesCondition } from '../checkValueSatisfiesCondition';

describe('checkAgainstConditions', () => {
  describe('checkValueSatisfiesCondition()', () => {
    it('should throw an error if given an unknown operator', () => {
      expect(() => checkValueSatisfiesCondition('hello', { operator: 'NOT_VALID' })).to.throw(
        "Unknown operator: 'NOT_VALID'",
      );
    });

    it('should correctly check if a value satisfies a plain condition', () => {
      expect(checkValueSatisfiesCondition('hello', 'hello')).to.be.true;
      expect(checkValueSatisfiesCondition(0, 0)).to.be.true;
      expect(checkValueSatisfiesCondition(true, true)).to.be.true;
      expect(checkValueSatisfiesCondition(false, false)).to.be.true;
      expect(checkValueSatisfiesCondition(null, null)).to.be.true;

      expect(checkValueSatisfiesCondition('hello', 'hi')).to.be.false;
      expect(checkValueSatisfiesCondition(0, '')).to.be.false;
      expect(checkValueSatisfiesCondition(true, 1)).to.be.false;

      // Undefined value never satisfies any condition
      expect(checkValueSatisfiesCondition(undefined, undefined)).to.be.false;
    });

    it('should return true if the condition is "*" unless the value is undefined or ""', () => {
      expect(checkValueSatisfiesCondition('hello', '*')).to.be.true;
      expect(checkValueSatisfiesCondition(0, '*')).to.be.true;
      expect(checkValueSatisfiesCondition(false, '*')).to.be.true;
      expect(checkValueSatisfiesCondition(null, '*')).to.be.true;

      expect(checkValueSatisfiesCondition('', '*')).to.be.false;
      expect(checkValueSatisfiesCondition(undefined, '*')).to.be.false;
    });

    it('should work with basic mathematical conditions', () => {
      expect(checkValueSatisfiesCondition(1, { operator: '=', value: 1 })).to.be.true;
      expect(checkValueSatisfiesCondition(2, { operator: '=', value: 1 })).to.be.false;

      expect(checkValueSatisfiesCondition(1, { operator: '<', value: 2 })).to.be.true;
      expect(checkValueSatisfiesCondition(2, { operator: '<', value: 2 })).to.be.false;

      expect(checkValueSatisfiesCondition(2, { operator: '>', value: 1 })).to.be.true;
      expect(checkValueSatisfiesCondition(1, { operator: '>', value: 1 })).to.be.false;

      expect(checkValueSatisfiesCondition(1, { operator: '>=', value: 1 })).to.be.true;
      expect(checkValueSatisfiesCondition(0, { operator: '>=', value: 1 })).to.be.false;

      expect(checkValueSatisfiesCondition(1, { operator: '<=', value: 1 })).to.be.true;
      expect(checkValueSatisfiesCondition(2, { operator: '<=', value: 1 })).to.be.false;

      expect(checkValueSatisfiesCondition(1, { operator: '<=', value: 1 })).to.be.true;
      expect(checkValueSatisfiesCondition(2, { operator: '<=', value: 1 })).to.be.false;
    });

    it('should work with range mathematical conditions', () => {
      expect(checkValueSatisfiesCondition(-1, { operator: 'range', value: [1, 2] })).to.be.false;
      expect(checkValueSatisfiesCondition(1, { operator: 'range', value: [1, 2] })).to.be.true;
      expect(checkValueSatisfiesCondition(1.5, { operator: 'range', value: [1, 2] })).to.be.true;
      expect(checkValueSatisfiesCondition(2, { operator: 'range', value: [1, 2] })).to.be.true;
      expect(checkValueSatisfiesCondition(3, { operator: 'range', value: [1, 2] })).to.be.false;

      expect(checkValueSatisfiesCondition(-1, { operator: 'rangeExclusive', value: [1, 2] })).false;
      expect(checkValueSatisfiesCondition(1, { operator: 'rangeExclusive', value: [1, 2] })).false;
      expect(checkValueSatisfiesCondition(1.5, { operator: 'rangeExclusive', value: [1, 2] })).true;
      expect(checkValueSatisfiesCondition(2, { operator: 'rangeExclusive', value: [1, 2] })).false;
      expect(checkValueSatisfiesCondition(3, { operator: 'rangeExclusive', value: [1, 2] })).false;
    });

    it('should return false with mathematical conditions if the value is ""', () => {
      expect(checkValueSatisfiesCondition('', { operator: '=', value: 1 })).to.be.false;
      expect(checkValueSatisfiesCondition('', { operator: '<', value: 2 })).to.be.false;
      expect(checkValueSatisfiesCondition('', { operator: '>', value: 1 })).to.be.false;
      expect(checkValueSatisfiesCondition('', { operator: '>=', value: 1 })).to.be.false;
      expect(checkValueSatisfiesCondition('', { operator: '<=', value: 1 })).to.be.false;
      expect(checkValueSatisfiesCondition('', { operator: '<=', value: 1 })).to.be.false;
      expect(checkValueSatisfiesCondition('', { operator: 'range', value: [1, 2] })).to.be.false;
      expect(checkValueSatisfiesCondition('', { operator: 'rangeExclusive', value: [1, 2] })).false;
    });

    it('should check "in" correctly', () => {
      const commonConfig = { operator: 'in', value: ['', undefined, null, 'hi', 1, 2] };
      expect(checkValueSatisfiesCondition('', commonConfig)).to.be.true;
      expect(checkValueSatisfiesCondition(null, commonConfig)).to.be.true;
      expect(checkValueSatisfiesCondition('hi', commonConfig)).to.be.true;
      expect(checkValueSatisfiesCondition(1, commonConfig)).to.be.true;
      expect(checkValueSatisfiesCondition(3, commonConfig)).to.be.false;
      expect(checkValueSatisfiesCondition(undefined, commonConfig)).to.be.false;
      expect(checkValueSatisfiesCondition('hello', commonConfig)).to.be.false;
    });

    it('operator "in" works with strings correctly', () => {
      const commonConfig = { operator: 'in', value: 'This is my string' };
      expect(checkValueSatisfiesCondition('', commonConfig)).to.be.true;
      expect(checkValueSatisfiesCondition('string', commonConfig)).to.be.true;
      expect(checkValueSatisfiesCondition(0, commonConfig)).to.be.false;
      expect(checkValueSatisfiesCondition(undefined, commonConfig)).to.be.false;
      expect(checkValueSatisfiesCondition('hello', commonConfig)).to.be.false;
    });

    it('operator "regex" works correctly', () => {
      expect(checkValueSatisfiesCondition('hi five!', { operator: 'regex', value: 'hi' })).true;
      expect(checkValueSatisfiesCondition('hi five!', { operator: 'regex', value: /hi/ })).true;
      expect(checkValueSatisfiesCondition('hi five!', { operator: 'regex', value: '[hgf]i' })).true;
      expect(checkValueSatisfiesCondition('hi five!', { operator: 'regex', value: /[hgf]i/ })).true;
      expect(checkValueSatisfiesCondition('', { operator: 'regex', value: '' })).true;

      expect(checkValueSatisfiesCondition('hi five!', { operator: 'regex', value: 'Hello' })).false;
      expect(checkValueSatisfiesCondition('hi five!', { operator: 'regex', value: 'Hi' })).false;
      expect(checkValueSatisfiesCondition(undefined, { operator: 'regex', value: '' })).false;
    });
  });
});
