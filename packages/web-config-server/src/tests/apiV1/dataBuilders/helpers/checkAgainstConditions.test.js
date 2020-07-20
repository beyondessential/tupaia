import { expect } from 'chai';

import {
  checkValueSatisfiesCondition,
  countEventsThatSatisfyConditions,
  countAnalyticsThatSatisfyConditions,
} from '/apiV1/dataBuilders/helpers';

const buildEvent = dataValueMap => ({
  dataValues: Object.entries(dataValueMap).reduce((results, [dataElement, value]) => {
    return { ...results, [dataElement]: { value } };
  }, {}),
});

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

      // Undefined value never satisties any condition
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
  describe('countEventsThatSatisfyConditions()', () => {
    const events = [
      buildEvent({ temperature: '2', result: 'Positive' }),
      buildEvent({ temperature: '5', result: 'Positive' }),
      buildEvent({ temperature: '7', result: 'Positive Mixed' }),
      buildEvent({ temperature: '2', result: 'Negative' }),
      buildEvent({ temperature: '', result: '' }),
    ];
    const assertCountOfEventsForConditions = (conditions, expectedResult) =>
      expect(countEventsThatSatisfyConditions(events, conditions)).to.equal(expectedResult);

    it('should return the event count when no conditions are specified', () => {
      assertCountOfEventsForConditions({}, events.length);
      assertCountOfEventsForConditions(undefined, events.length);
      assertCountOfEventsForConditions(null, events.length);
    });

    it('should count events with data values equal to a value', () => {
      const conditions = {
        dataValues: { temperature: '2' },
      };
      assertCountOfEventsForConditions(conditions, 2);
    });

    it('should be able to check for equality to an empty string', () => {
      const conditions = {
        dataValues: { temperature: '' },
      };
      assertCountOfEventsForConditions(conditions, 1);
    });

    it('should return the event count when an "any value" condition is used, not including empty strings', () => {
      const conditions = {
        dataValues: { temperature: '*' },
      };
      assertCountOfEventsForConditions(conditions, 4);
    });

    it('should return zero for wrong data elements', () => {
      const conditions = {
        dataValues: { wrongDataElement: '2' },
      };
      assertCountOfEventsForConditions(conditions, 0);
    });

    it('should count events with multiple conditions using AND logic', () => {
      const conditions = {
        dataValues: { temperature: '2', result: 'Negative' },
      };
      assertCountOfEventsForConditions(conditions, 1);
    });

    it('should count events with data values greater than a value', () => {
      const conditions = {
        dataValues: { temperature: { operator: '>=', value: '7' } },
      };
      assertCountOfEventsForConditions(conditions, 1);
    });

    it('should count events with data values less than a value', () => {
      const conditions = {
        dataValues: { temperature: { operator: '<', value: '7' } },
      };
      assertCountOfEventsForConditions(conditions, 3);
    });

    it('should count events with data values within a closed range', () => {
      const conditions = {
        dataValues: { temperature: { operator: 'range', value: [2, 5] } },
      };
      assertCountOfEventsForConditions(conditions, 3);
    });

    it('should count events with data values matching a regular expression', () => {
      const conditions = {
        dataValues: { result: { operator: 'regex', value: 'Positive' } },
      };
      assertCountOfEventsForConditions(conditions, 3);
    });
  });

  describe('countAnalyticsThatSatisfyConditions()', () => {
    const analytics = [
      { dataElement: 'temperature', value: 2 },
      { dataElement: 'result', value: 'Positive' },
      { dataElement: 'temperature', value: 5 },
      { dataElement: 'result', value: 'Positive' },
      { dataElement: 'temperature', value: 7 },
      { dataElement: 'result', value: 'Positive Mixed' },
      { dataElement: 'temperature', value: 2 },
      { dataElement: 'result', value: 'Negative' },
    ];
    const assertCountOfAnalyticsForConditions = (conditions, expectedResult) =>
      expect(countAnalyticsThatSatisfyConditions(analytics, conditions)).to.equal(expectedResult);

    it('should return 0 when no conditions are specified', () => {
      assertCountOfAnalyticsForConditions({}, 0);
      assertCountOfAnalyticsForConditions(undefined, 0);
      assertCountOfAnalyticsForConditions(null, 0);
    });

    it('should count analytics with data values equal to a value', () => {
      const conditions = {
        dataValues: ['temperature'],
        valueOfInterest: 2,
      };
      assertCountOfAnalyticsForConditions(conditions, 2);
    });

    it('should count analytics for an "any value condition"', () => {
      const conditions = {
        dataValues: ['result'],
        valueOfInterest: '*',
      };
      assertCountOfAnalyticsForConditions(conditions, 4);
    });

    it('should count analytics with data values greater than a value', () => {
      const conditions = {
        dataValues: ['temperature'],
        valueOfInterest: { value: 7, operator: '>=' },
      };
      assertCountOfAnalyticsForConditions(conditions, 1);
    });

    it('should count analytics with data values less than a value', () => {
      const conditions = {
        dataValues: ['temperature'],
        valueOfInterest: { value: 7, operator: '<' },
      };
      assertCountOfAnalyticsForConditions(conditions, 3);
    });

    it('should count analytics with data values within a range', () => {
      const conditions = {
        dataValues: ['temperature'],
        valueOfInterest: { value: [2, 5], operator: 'range' },
      };
      assertCountOfAnalyticsForConditions(conditions, 3);
    });

    it('should count analytics with data values matching a regular expression', () => {
      const conditions = {
        dataValues: ['result'],
        valueOfInterest: { value: 'Positive', operator: 'regex' },
      };
      assertCountOfAnalyticsForConditions(conditions, 3);
    });
  });
});
