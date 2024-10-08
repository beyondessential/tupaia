/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';
import sinon from 'sinon';
import { roundStartEndDates, getDefaultDates, getLimits } from '../../period/periodGranularities';

const DEFAULT_NOW_TIMESTAMP = 1549360800000; // 2019-02-05T10:00:00.000Z

const mockNow = (whenIsNow = DEFAULT_NOW_TIMESTAMP) => {
  sinon.useFakeTimers(whenIsNow);
};

const resetMocks = () => {
  sinon.restore();
};

describe('chartGranularities', () => {
  beforeEach(() => {
    mockNow(1549360800 * 1000); // (2019-02-05 10:00 UTC)
  });

  afterEach(() => {
    resetMocks();
  });

  describe('roundStartEndDates', () => {
    it('rounds', () => {
      const { startDate, endDate } = roundStartEndDates(
        'day',
        moment('2019-02-01T13:14:15+11:00'),
        moment('2019-02-02T13:14:15+11:00'),
      );
      expect(startDate.format()).toEqual('2019-02-01T00:00:00+11:00');
      expect(endDate.format()).toEqual('2019-02-02T23:59:59+11:00');
    });

    it('uses today if dates not specified', () => {
      const { startDate, endDate } = roundStartEndDates('day');
      expect(startDate.format()).toEqual('2019-02-05T00:00:00+11:00');
      expect(endDate.format()).toEqual('2019-02-05T23:59:59+11:00');
    });
  });

  describe('getDefaultDates', () => {
    it('gives nothing if no period granularity set', () => {
      const result = getDefaultDates({});
      expect(result).toEqual({});
    });

    describe('defaultTimePeriod with single period', () => {
      it('gives today by default', () => {
        const { startDate, endDate } = getDefaultDates({
          periodGranularity: 'one_day_at_a_time',
          defaultTimePeriod: null,
        });
        expect(startDate.format()).toEqual('2019-02-05T00:00:00+11:00');
        expect(endDate.format()).toEqual('2019-02-05T23:59:59+11:00');
      });

      it('basic config works', () => {
        const { startDate, endDate } = getDefaultDates({
          periodGranularity: 'one_day_at_a_time',
          defaultTimePeriod: {
            start: { unit: 'day', offset: -1 },
          },
        });
        expect(startDate.format()).toEqual('2019-02-04T00:00:00+11:00');
        expect(endDate.format()).toEqual('2019-02-04T23:59:59+11:00');
      });

      it('throws if unit does not match period granularity', () => {
        // The reason for this limitation is to prevent devs from confusing themselves.
        // E.g. if periodGranularity is one_month_at_a_time, and offset is +5 days, it will not take
        // effect, the start date will be rounded to the start of the month.
        const functionCall = () =>
          getDefaultDates({
            periodGranularity: 'one_month_at_a_time',
            defaultTimePeriod: {
              start: { unit: 'day', offset: -3 },
            },
          });
        expect(functionCall).toThrow('defaultTimePeriod unit must match periodGranularity');
      });

      it('ignores end offset if both provided', () => {
        // Because we are one_day_at_a_time, end date is restricted to the end of that period (in this case, the day),
        // so is ignored when specified alongside start.
        const { startDate, endDate } = getDefaultDates({
          periodGranularity: 'one_day_at_a_time',
          defaultTimePeriod: {
            start: { unit: 'day', offset: -1 },
            end: { unit: 'day', offset: 3 },
          },
        });
        expect(startDate.format()).toEqual('2019-02-04T00:00:00+11:00');
        expect(endDate.format()).toEqual('2019-02-04T23:59:59+11:00');
      });

      it('works when only end date provided', () => {
        const { startDate, endDate } = getDefaultDates({
          periodGranularity: 'one_day_at_a_time',
          defaultTimePeriod: {
            end: { unit: 'day', offset: -2 },
          },
        });
        expect(startDate.format()).toEqual('2019-02-03T00:00:00+11:00');
        expect(endDate.format()).toEqual('2019-02-03T23:59:59+11:00');
      });

      it('works when only end date provided, with range granularity', () => {
        const { startDate, endDate } = getDefaultDates({
          periodGranularity: 'one_week_at_a_time',
          defaultTimePeriod: {
            end: { unit: 'week', offset: -2 },
          },
        });
        expect(startDate.format()).toEqual('2019-01-21T00:00:00+11:00');
        expect(endDate.format()).toEqual('2019-01-27T23:59:59+11:00');
      });

      it('rounds to closest week when start is a date string', () => {
        const { startDate, endDate } = getDefaultDates({
          periodGranularity: 'week',
          defaultTimePeriod: {
            start: '2019-02-05',
          },
        });
        expect(startDate.format()).toEqual('2019-02-04T00:00:00+11:00');
        expect(endDate.format()).toEqual('2019-02-10T23:59:59+11:00');
      });

      it('throws an error when start is a date string with daily granularity', () => {
        const functionCall = () =>
          getDefaultDates({
            periodGranularity: 'one_day_at_a_time',
            defaultTimePeriod: {
              start: '2019-02-05',
            },
          });
        expect(functionCall).toThrow(
          'defaultTimePeriod unit must match periodGranularity (periodGranularity: one_day_at_a_time, valid unit: day, given: undefined)',
        );
      });

      it('rounds to closest week when start and end are date strings', () => {
        const { startDate, endDate } = getDefaultDates({
          periodGranularity: 'week',
          defaultTimePeriod: {
            start: '2019-02-05',
            end: '2019-02-11',
          },
        });
        expect(startDate.format()).toEqual('2019-02-04T00:00:00+11:00');
        expect(endDate.format()).toEqual('2019-02-17T23:59:59+11:00');
      });

      it('shorthand syntax', () => {
        /*
         * Equivalent to:
         *   defaultTimePeriod: {
         *     start: { unit: 'day', offset: -1 },
         *   }
         */
        const { startDate, endDate } = getDefaultDates({
          periodGranularity: 'one_day_at_a_time',
          defaultTimePeriod: {
            unit: 'day',
            offset: -1,
          },
        });
        expect(startDate.format()).toEqual('2019-02-04T00:00:00+11:00');
        expect(endDate.format()).toEqual('2019-02-04T23:59:59+11:00');
      });

      it('calculates current period if positive offset is provided and the closest period would start in the future', () => {
        const { startDate, endDate } = getDefaultDates({
          periodGranularity: 'one_year_at_a_time',
          dateOffset: {
            unit: 'month',
            offset: 6,
          },
        });
        expect(startDate.format()).toEqual('2018-07-01T00:00:00+10:00');
        expect(endDate.format()).toEqual('2019-06-30T23:59:59+10:00');
      });

      it('calculates the correct period if a positive offset is provided and closest period has already started', () => {
        const { startDate, endDate } = getDefaultDates({
          periodGranularity: 'one_year_at_a_time',
          dateOffset: {
            unit: 'month',
            offset: 1, // feb - jan
          },
        });
        expect(startDate.format()).toEqual('2019-02-01T00:00:00+11:00');
        expect(endDate.format()).toEqual('2020-01-31T23:59:59+11:00');
      });

      it('calculates current period if negative offset is provided ', () => {
        // e.g. if we are in feb 2019, and we want to see march-feb
        const { startDate, endDate } = getDefaultDates({
          periodGranularity: 'one_year_at_a_time',
          dateOffset: {
            unit: 'month',
            offset: -10, // feb - jan the previous year
          },
        });
        expect(startDate.format()).toEqual('2018-03-01T00:00:00+11:00');
        expect(endDate.format()).toEqual('2019-02-28T23:59:59+11:00');
      });

      it('calculates offset default dates with months and weeks', () => {
        const { startDate, endDate } = getDefaultDates({
          periodGranularity: 'one_month_at_a_time',
          dateOffset: {
            unit: 'week',
            offset: 2, // start mid month
          },
        });
        expect(startDate.format()).toEqual('2019-01-15T00:00:00+11:00');
        expect(endDate.format()).toEqual('2019-02-14T23:59:59+11:00');
      });

      it('calculates offset default dates with months and days', () => {
        const { startDate, endDate } = getDefaultDates({
          periodGranularity: 'one_month_at_a_time',
          dateOffset: {
            unit: 'day',
            offset: 5, // start 5 days into the month
          },
        });
        expect(startDate.format()).toEqual('2019-01-06T00:00:00+11:00');
        expect(endDate.format()).toEqual('2019-02-05T23:59:59+11:00');
      });

      it('calculates offset default dates with weeks and days', () => {
        const { startDate, endDate } = getDefaultDates({
          periodGranularity: 'one_week_at_a_time',
          dateOffset: {
            unit: 'day',
            offset: 4, // start 4 days into the week
          },
        });
        expect(startDate.format()).toEqual('2019-02-01T00:00:00+11:00');
        expect(endDate.format()).toEqual('2019-02-07T23:59:59+11:00');
      });

      it('calculates offset default dates with years and quarters', () => {
        const { startDate, endDate } = getDefaultDates({
          periodGranularity: 'one_year_at_a_time',
          dateOffset: {
            unit: 'quarter',
            offset: 3, // q4-q1
          },
        });
        expect(startDate.format()).toEqual('2018-10-01T00:00:00+10:00');
        expect(endDate.format()).toEqual('2019-09-30T23:59:59+10:00');
      });
    });

    describe('defaultTimePeriod with a date range', () => {
      it('uses the default date range for empty config', () => {
        const { startDate, endDate } = getDefaultDates({
          periodGranularity: 'day',
          defaultTimePeriod: null,
        });
        expect(startDate.format()).toEqual('2015-01-01T00:00:00+11:00');
        expect(endDate.format()).toEqual('2019-02-05T21:00:00+11:00');
      });

      it('basic config works', () => {
        const { startDate, endDate } = getDefaultDates({
          periodGranularity: 'day',
          defaultTimePeriod: {
            start: { unit: 'day', offset: -1 },
            end: { unit: 'day', offset: 3 },
          },
        });
        expect(startDate.format()).toEqual('2019-02-04T00:00:00+11:00');
        expect(endDate.format()).toEqual('2019-02-08T23:59:59+11:00');
      });

      it('works with offset dates', () => {
        const { startDate, endDate } = getDefaultDates({
          periodGranularity: 'one_year_at_a_time',
          defaultTimePeriod: {
            start: { unit: 'year', offset: 2 },
            end: { unit: 'year', offset: 2 },
          },
          dateOffset: {
            unit: 'quarter',
            offset: 3, // q4-q1
          },
        });
        expect(startDate.format()).toEqual('2020-10-01T00:00:00+10:00');
        expect(endDate.format()).toEqual('2021-09-30T23:59:59+10:00');
      });
    });
  });

  describe('getLimits', () => {
    it('gives nothing if no config', () => {
      const { startDate, endDate } = getLimits('day');
      expect(startDate).toBeNull();
      expect(endDate).toBeNull();
    });

    it('throws if either unit does not match period granularity', () => {
      // The reason for this limitation is to prevent devs from confusing themselves.
      // E.g. if periodGranularity is one_month_at_a_time, and offset is +5 days, it will not take
      // effect, the start date will be rounded to the start of the month.
      const functionCall = () =>
        getLimits('one_month_at_a_time', { start: { unit: 'day', offset: -3 } });
      expect(functionCall).toThrow('limit unit must match periodGranularity');
    });

    it('calculates limits', () => {
      const { startDate, endDate } = getLimits('day', { start: { unit: 'day', offset: -3 } });
      expect(startDate.format()).toEqual('2019-02-02T00:00:00+11:00'); // rounded
      expect(endDate.format()).toEqual('2019-02-05T23:59:59+11:00'); // rounded
    });
  });
});
