/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';
import { mockNow, resetMocks } from '../testutil';
import {
  roundStartEndDates,
  getDefaultDateRangeToFetch,
  getDatePickerLimits,
} from '../../utils/periodGranularities';

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

  describe('getDefaultDateRangeToFetch', () => {
    it('gives nothing if no period granularity set', () => {
      const result = getDefaultDateRangeToFetch({});
      expect(result).toEqual({});
    });

    describe('defaultTimePeriod with single period', () => {
      it('gives today by default', () => {
        const { startDate, endDate } = getDefaultDateRangeToFetch({
          periodGranularity: 'one_day_at_a_time',
          defaultTimePeriod: null,
        });
        expect(startDate.format()).toEqual('2019-02-05T00:00:00+11:00');
        expect(endDate.format()).toEqual('2019-02-05T23:59:59+11:00');
      });

      it('basic config works', () => {
        const { startDate, endDate } = getDefaultDateRangeToFetch({
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
          getDefaultDateRangeToFetch({
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
        const { startDate, endDate } = getDefaultDateRangeToFetch({
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
        const { startDate, endDate } = getDefaultDateRangeToFetch({
          periodGranularity: 'one_day_at_a_time',
          defaultTimePeriod: {
            end: { unit: 'day', offset: -2 },
          },
        });
        expect(startDate.format()).toEqual('2019-02-03T00:00:00+11:00');
        expect(endDate.format()).toEqual('2019-02-03T23:59:59+11:00');
      });

      it('shorthand syntax', () => {
        /*
         * Equivalent to:
         *   defaultTimePeriod: {
         *     start: { unit: 'day', offset: -1 },
         *   }
         */
        const { startDate, endDate } = getDefaultDateRangeToFetch({
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
        const { startDate, endDate } = getDefaultDateRangeToFetch({
          periodGranularity: 'day',
          defaultTimePeriod: null,
        });
        expect(startDate.format()).toEqual('2015-01-01T00:00:00+11:00');
        expect(endDate.format()).toEqual('2019-02-05T21:00:00+11:00');
      });

      it('basic config works', () => {
        const { startDate, endDate } = getDefaultDateRangeToFetch({
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

  describe('getDatePickerLimits', () => {
    it('gives nothing if no config', () => {
      const { startDate, endDate } = getDatePickerLimits('day');
      expect(startDate).toBeNull();
      expect(endDate).toBeNull();
    });

    it('throws if either unit does not match period granularity', () => {
      // The reason for this limitation is to prevent devs from confusing themselves.
      // E.g. if periodGranularity is one_month_at_a_time, and offset is +5 days, it will not take
      // effect, the start date will be rounded to the start of the month.
      const functionCall = () =>
        getDatePickerLimits('one_month_at_a_time', { start: { unit: 'day', offset: -3 } });
      expect(functionCall).toThrow('limit unit must match periodGranularity');
    });

    it('calculates limits', () => {
      const { startDate, endDate } = getDatePickerLimits('day', {
        start: { unit: 'day', offset: -3 },
      });
      expect(startDate.format()).toEqual('2019-02-02T00:00:00+11:00'); // rounded
      expect(endDate.format()).toEqual('2019-02-05T23:59:59+11:00'); // rounded
    });
  });
});
