/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { RRule } from 'rrule';
import {
  RRULE_FREQUENCIES,
  generateDailyRRule,
  generateMonthlyRRule,
  generateRRule,
  generateWeeklyRRule,
  generateYearlyRRule,
  getNextOccurrence,
} from '../rrule';

describe('RRule', () => {
  it('generateDailyRRule should return an RRule that will repeat daily from the given start date', () => {
    const rrule = generateDailyRRule(new Date('2021-01-01'));
    expect(rrule).toEqual(
      new RRule({
        freq: RRule.DAILY,
        dtstart: new Date('2021-01-01'),
        interval: 1,
      }),
    );
    const all = rrule.all();
    expect(all[0]).toEqual(new Date('2021-01-01'));
    expect(all[1]).toEqual(new Date('2021-01-02'));
  });

  it('generateDailyRRule should return an RRule that will repeat daily from the given start date when date is a string', () => {
    const rrule = generateDailyRRule('2021-01-01T00:00:00.000-08:00');
    expect(rrule).toEqual(
      new RRule({
        freq: RRule.DAILY,
        dtstart: new Date('2021-01-01T00:00:00.000-08:00'),
        interval: 1,
      }),
    );
    const all = rrule.all();
    expect(all[0]).toEqual(new Date('2021-01-01T00:00:00.000-08:00'));
    expect(all[1]).toEqual(new Date('2021-01-02T00:00:00.000-08:00'));
  });

  it('generateWeeklyRRule should return an RRule that will repeat weekly from the given start date', () => {
    const startDate = new Date('2021-01-01');
    const rrule = generateWeeklyRRule(startDate);
    expect(rrule).toEqual(
      new RRule({
        freq: RRule.WEEKLY,
        dtstart: startDate,
        interval: 1,
      }),
    );
    const all = rrule.all();
    expect(all[0]).toEqual(startDate);
    expect(all[1]).toEqual(new Date('2021-01-08'));
  });

  it('generateWeeklyRRule should return an RRule that will repeat weekly from the given start date, when startDate is a string', () => {
    const startDate = '2021-01-01T00:00:00.000-08:00';
    const rrule = generateWeeklyRRule(startDate);
    expect(rrule).toEqual(
      new RRule({
        freq: RRule.WEEKLY,
        dtstart: new Date(startDate),
        interval: 1,
      }),
    );
    const all = rrule.all();
    expect(all[0]).toEqual(new Date(startDate));
    expect(all[1]).toEqual(new Date('2021-01-08T00:00:00.000-08:00'));
  });

  it('generateMonthlyRRule should return an RRule that will repeat monthly from the given start date', () => {
    const startDate = new Date('2021-01-01');
    const rrule = generateMonthlyRRule(startDate);
    expect(rrule).toEqual(
      new RRule({
        freq: RRule.MONTHLY,
        dtstart: startDate,
        bymonthday: [startDate.getDate()],
        interval: 1,
      }),
    );
    const all = rrule.all();
    expect(all[0]).toEqual(startDate);
    expect(all[1]).toEqual(new Date('2021-02-01'));
  });

  it('generateMonthlyRRule should handle when startDate is last day of the month utc time', () => {
    const startDate = '2021-01-30T23:59:59.999-08:00';
    const utcDate = new Date(startDate);
    const rrule = generateMonthlyRRule(startDate);
    expect(rrule).toEqual(
      new RRule({
        freq: RRule.MONTHLY,
        dtstart: utcDate,
        bymonthday: [-1],
        interval: 1,
      }),
    );
    const all = rrule.all();
    expect(all[0]).toEqual(utcDate);
    expect(all[1]).toEqual(new Date('2021-02-27T23:59:59.999-08:00'));
  });

  it('generateMonthlyRRule should return an RRule that will repeat monthly on the last day of the month if the given start date is the last day of that month', () => {
    const startDate = new Date('2021-01-31');
    const rrule = generateMonthlyRRule(startDate);
    expect(rrule).toEqual(
      new RRule({
        freq: RRule.MONTHLY,
        dtstart: startDate,
        bymonthday: [-1],
        interval: 1,
      }),
    );
    expect(rrule.all()[0]).toEqual(startDate);
    expect(rrule.after(new Date('2021-01-31'))).toEqual(new Date('2021-02-28'));
    expect(rrule.after(new Date('2021-04-01'))).toEqual(new Date('2021-04-30'));
    expect(rrule.after(new Date('2024-01-31'))).toEqual(new Date('2024-02-29'));
  });

  it('generateMonthlyRRule should handle when date is a string with a timezone for last day of month local time', () => {
    // 31 Jan 2021 23:59:59.999 in Los Angeles timezone
    const startDate = '2021-01-31T23:59:59.999-08:00';
    const rrule = generateMonthlyRRule(startDate);
    expect(rrule).toEqual(
      new RRule({
        freq: RRule.MONTHLY,
        // saves the date as UTC
        dtstart: new Date(startDate),
        // by month day is 1 because the date is the last day of the month in local time but the first day of the month in UTC
        bymonthday: [1],
        interval: 1,
      }),
    );

    // the first occurrence should be the equivalent of the last day of january in UTC
    expect(rrule.all()[0]).toEqual(new Date(startDate));
    expect(rrule.after(new Date('2021-02-01T00:00:00.000-08:00'))).toEqual(
      new Date('2021-02-28T23:59:59.999-08:00'),
    );
    expect(rrule.after(new Date('2021-04-01T00:00:00.000-08:00'))).toEqual(
      new Date('2021-04-30T23:59:59.999-08:00'),
    );
    expect(rrule.after(new Date('2024-01-31T23:59:59.999-08:00'))).toEqual(
      new Date('2024-02-29T23:59:59.999-08:00'),
    );
  });

  it('generateMonthlyRRule should return an RRule that will repeat monthly on either the 30th or the last day of the month for February if the given start date is the 30th', () => {
    const startDate = new Date('2021-01-30');
    const rrule = generateMonthlyRRule(startDate);
    expect(rrule).toEqual(
      new RRule({
        freq: RRule.MONTHLY,
        dtstart: startDate,
        bymonthday: [28, 29, 30],
        bysetpos: -1,
        interval: 1,
      }),
    );
    expect(rrule.all()[0]).toEqual(startDate);
    expect(rrule.all()[1]).toEqual(new Date('2021-02-28'));
    expect(rrule.after(new Date('2024-01-31'))).toEqual(new Date('2024-02-29'));
  });

  it('generateMonthlyRRule should return an RRule that will repeat monthly on either the 30th or the last day of the month for February if the given start date is the 30th in UTC time', () => {
    const startDate = '2021-01-29T23:59:59.999-08:00';
    const rrule = generateMonthlyRRule(startDate);
    expect(rrule).toEqual(
      new RRule({
        freq: RRule.MONTHLY,
        dtstart: new Date(startDate),
        bymonthday: [28, 29, 30],
        bysetpos: -1,
        interval: 1,
      }),
    );

    const all = rrule.all();
    expect(all[0]).toEqual(new Date(startDate));
    expect(all[1]).toEqual(new Date('2021-02-27T23:59:59.999-08:00'));
    expect(rrule.after(new Date('2024-01-31T23:59:59.999-08:00'))).toEqual(
      new Date('2024-02-28T23:59:59.999-08:00'),
    );
  });

  it('generateYearlyRRule should return an RRule that will repeat yearly from the given start date', () => {
    const startDate = new Date('2021-01-30');
    const rrule = generateYearlyRRule(startDate);
    expect(rrule).toEqual(
      new RRule({
        freq: RRule.YEARLY,
        dtstart: startDate,
        interval: 1,
      }),
    );
    const all = rrule.all();
    expect(all[0]).toEqual(startDate);
    expect(all[1]).toEqual(new Date('2022-01-30'));
  });

  it('generateYearlyRRule should return an RRule that will repeat yearly from the given start date, and startDate is a string', () => {
    const startDate = '2021-01-30T00:00:00.000-08:00';
    const rrule = generateYearlyRRule(startDate);
    expect(rrule).toEqual(
      new RRule({
        freq: RRule.YEARLY,
        dtstart: new Date(startDate),
        interval: 1,
      }),
    );
    const all = rrule.all();
    expect(all[0]).toEqual(new Date(startDate));
    expect(all[1]).toEqual(new Date('2022-01-30T00:00:00.000-08:00'));
  });

  it('generateRRule should return an RRule using the start date and frequency', () => {
    const startDate = new Date('2021-01-30');
    const rrule = generateRRule(startDate, RRULE_FREQUENCIES.YEARLY);
    expect(rrule).toEqual(
      new RRule({
        freq: RRule.YEARLY,
        dtstart: startDate,
        interval: 1,
      }),
    );
  });

  it('getNextOccurrence should return the next occurrence for a specific rrule', () => {
    expect(
      getNextOccurrence(
        {
          freq: RRule.YEARLY,
          dtstart: new Date('2021-01-30'),
          interval: 1,
        },
        new Date('2022-01-19'),
      ),
    ).toEqual(new Date('2022-01-30'));
  });
});
