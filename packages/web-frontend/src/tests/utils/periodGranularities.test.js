/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';
import { mockNow, resetMocks } from '../testutil';
import { roundStartEndDates, getDefaultDates, getLimits } from '../../utils/periodGranularities';

describe('periodGranularities', () => {
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
            start: '2019-01-15',
          },
        });
        expect(startDate.format()).toEqual('2019-01-14T00:00:00+11:00');
        expect(endDate.format()).toEqual('2019-02-10T23:59:59+11:00');
      });

      it('works when start is a date string with daily granularity', () => {
        const { startDate, endDate } = getDefaultDates({
          periodGranularity: 'one_day_at_a_time',
          defaultTimePeriod: {
            start: '2019-01-15',
          },
        });
        expect(startDate.format()).toEqual('2019-01-15T00:00:00+11:00');
        expect(endDate.format()).toEqual('2019-01-15T23:59:59+11:00');
      });

      it('rounds to closest week when start and end are date strings', () => {
        const { startDate, endDate } = getDefaultDates({
          periodGranularity: 'week',
          defaultTimePeriod: {
            start: '2018-05-05',
            end: '2019-01-01',
          },
        });
        expect(startDate.format()).toEqual('2018-04-30T00:00:00+10:00');
        expect(endDate.format()).toEqual('2019-01-06T23:59:59+11:00');
      });

      it('throws if the end date is chronologically before the start date, with date strings', () => {
        const functionCall = () => {
          getDefaultDates({
            periodGranularity: 'day',
            defaultTimePeriod: {
              start: '2018-05-05',
              end: '2018-01-01',
            },
          });
        };
        expect(functionCall).toThrow('Start date must be earlier than the end date');
      });

      it('throws if the end date is chronologically before the start date, with offset', () => {
        const functionCall = () => {
          getDefaultDates({
            periodGranularity: 'day',
            defaultTimePeriod: {
              start: { unit: 'day', offset: -1 },
              end: { unit: 'day', offset: -2 },
            },
          });
        };
        expect(functionCall).toThrow('Start date must be earlier than the end date');
      });

      it('throws if the date string is in an unacceptable format', () => {
        const functionCall = () => {
          getDefaultDates({
            periodGranularity: 'day',
            defaultTimePeriod: {
              start: '2019-13-01',
            },
          });
        };
        expect(functionCall).toThrow('Date string is not in the correct format');
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
