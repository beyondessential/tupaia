/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { RRule } from 'rrule';
import {
  FREQUENCIES,
  generateDailyRRule,
  generateMonthlyRRule,
  generateRRule,
  generateWeeklyRRule,
  generateYearlyRRule,
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
    expect(rrule.all()[0]).toEqual(new Date('2021-01-01'));
    expect(rrule.all()[1]).toEqual(new Date('2021-01-02'));
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
    expect(rrule.all()[0]).toEqual(startDate);
    expect(rrule.all()[1]).toEqual(new Date('2021-01-08'));
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
    expect(rrule.all()[0]).toEqual(startDate);
    expect(rrule.all()[1]).toEqual(new Date('2021-02-01'));
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
    expect(rrule.all()[0]).toEqual(startDate);
    expect(rrule.all()[1]).toEqual(new Date('2022-01-30'));
  });

  it('generateRRule should return an RRule using the start date and frequency', () => {
    const startDate = new Date('2021-01-30');
    const rrule = generateRRule(startDate, FREQUENCIES.YEARLY);
    expect(rrule).toEqual(
      new RRule({
        freq: RRule.YEARLY,
        dtstart: startDate,
        interval: 1,
      }),
    );
  });
});
