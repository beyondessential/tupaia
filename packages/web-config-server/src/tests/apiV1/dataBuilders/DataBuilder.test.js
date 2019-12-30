import { expect } from 'chai';

import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

const buildEvent = dataValueMap => ({
  dataValues: Object.entries(dataValueMap).reduce((results, [dataElement, value]) => {
    return { ...results, [dataElement]: { value } };
  }, {}),
});

describe('DataBuilder', () => {
  describe('countEventsThatSatisfyConditions', () => {
    const events = [
      buildEvent({ temperature: '2', result: 'Positive' }),
      buildEvent({ temperature: '5', result: 'Positive' }),
      buildEvent({ temperature: '7', result: 'Positive Mixed' }),
      buildEvent({ temperature: '2', result: 'Negative' }),
    ];
    const assertCountOfEventsForConditions = (conditions, expectedResult) =>
      expect(new DataBuilder().countEventsThatSatisfyConditions(events, conditions)).to.equal(
        expectedResult,
      );

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

    it('should return the event count when an "any value" condition is used', () => {
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

  describe('countAnalyticsThatSatisfyConditions', () => {
    const analytics = [
      { dataElement: 'temperature', value: '2' },
      { dataElement: 'result', value: 'Positive' },
      { dataElement: 'temperature', value: '5' },
      { dataElement: 'result', value: 'Positive' },
      { dataElement: 'temperature', value: '7' },
      { dataElement: 'result', value: 'Positive Mixed' },
      { dataElement: 'temperature', value: '2' },
      { dataElement: 'result', value: 'Negative' },
    ];
    const assertCountOfAnalyticsForConditions = (conditions, expectedResult) =>
      expect(new DataBuilder().countAnalyticsThatSatisfyConditions(analytics, conditions)).to.equal(
        expectedResult,
      );

    it('should return 0 when no conditions are specified', () => {
      assertCountOfAnalyticsForConditions({}, 0);
      assertCountOfAnalyticsForConditions(undefined, 0);
      assertCountOfAnalyticsForConditions(null, 0);
    });

    it('should count analytics with data values equal to a value', () => {
      const conditions = {
        dataValues: { temperature: '2' },
      };
      assertCountOfAnalyticsForConditions(conditions, 2);
    });

    it('should count analytics for an "any value condition"', () => {
      const conditions = {
        dataValues: { result: '*' },
      };
      assertCountOfAnalyticsForConditions(conditions, 4);
    });

    it('should count analytics with multiple conditions using OR logic', () => {
      const conditions = {
        dataValues: { temperature: '2', result: 'Positive' },
      };
      assertCountOfAnalyticsForConditions(conditions, 4);
    });

    it('should count analytics with data values greater than a value', () => {
      const conditions = {
        dataValues: { temperature: { operator: '>=', value: '7' } },
      };
      assertCountOfAnalyticsForConditions(conditions, 1);
    });

    it('should count analytics with data values less than a value', () => {
      const conditions = {
        dataValues: { temperature: { operator: '<', value: '7' } },
      };
      assertCountOfAnalyticsForConditions(conditions, 3);
    });

    it('should count analytics with data values within a range', () => {
      const conditions = {
        dataValues: { temperature: { operator: 'range', value: [2, 5] } },
      };
      assertCountOfAnalyticsForConditions(conditions, 3);
    });

    it('should count analytics with data values matching a regular expression', () => {
      const conditions = {
        dataValues: { result: { operator: 'regex', value: 'Positive' } },
      };
      assertCountOfAnalyticsForConditions(conditions, 3);
    });
  });
});
