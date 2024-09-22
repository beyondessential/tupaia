/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { Frequency, RRule } from 'rrule';
import { getDaysInMonth } from 'date-fns';

export const RRULE_FREQUENCIES = {
  DAILY: Frequency.DAILY,
  WEEKLY: Frequency.WEEKLY,
  MONTHLY: Frequency.MONTHLY,
  YEARLY: Frequency.YEARLY,
};

export const generateRRule = (startDate, frequency) => {
  switch (frequency) {
    case RRULE_FREQUENCIES.DAILY:
      return generateDailyRRule(startDate);
    case RRULE_FREQUENCIES.WEEKLY:
      return generateWeeklyRRule(startDate);
    case RRULE_FREQUENCIES.MONTHLY:
      return generateMonthlyRRule(startDate);
    case RRULE_FREQUENCIES.YEARLY:
      return generateYearlyRRule(startDate);
    default:
      throw new Error(`Invalid frequency: ${frequency}`);
  }
};

/**
 *
 * @param {string | Date} startDate - The date to start the rule from
 * @returns {RRule} RRule that will repeat daily from the given start date
 */
export const generateDailyRRule = startDate => {
  return new RRule({
    freq: RRule.DAILY,
    dtstart: new Date(startDate),
    interval: 1,
  });
};

/**
 *
 * @param {string | Date} startDate - The date to start the rule from
 * @returns {RRule} RRule that will repeat weekly on the given days of the week from the given start date
 */
export const generateWeeklyRRule = startDate => {
  return new RRule({
    freq: RRule.WEEKLY,
    dtstart: new Date(startDate),
    interval: 1,
  });
};

/**
 *
 * @param {string | Date} startDate - The date to start the rule from
 * @returns  {RRule} RRule that will repeat monthly on the same day of the month as the given start date
 */
export const generateMonthlyRRule = startDate => {
  const utcDate = new Date(startDate);

  const dayOfMonth = utcDate.getDate();
  const numDaysInMonth = getDaysInMonth(utcDate);

  if (dayOfMonth < 28) {
    return new RRule({
      freq: RRule.MONTHLY,
      dtstart: utcDate,
      interval: 1,
      bymonthday: [dayOfMonth],
    });
  }

  // If the day of the month is the last day of the month, return a rule that will be applied to the last day of the month every month
  if (dayOfMonth === numDaysInMonth) {
    return new RRule({
      freq: RRule.MONTHLY,
      dtstart: utcDate,
      interval: 1,
      bymonthday: [-1],
    });
  }

  // Get the days of the month to check - if the given date is the 30th, this will include 28, 29, 30. If the given date is the 29th, this will include 28, 29
  const bymonthday = dayOfMonth === 30 ? [28, 29, 30] : [28, 29];

  return new RRule({
    freq: RRule.MONTHLY,
    dtstart: utcDate,
    interval: 1,
    bymonthday,
    // This will get the last available date from the bymonthday array. For example, if the dayOfMonth is 30, the bymonthday array will be [28, 29, 30] and the bysetpos will be -1, which will get the 30th day of the month if it exists, otherwise the 28th or 29th (for February)
    bysetpos: -1,
  });
};

/**
 *
 * @param {string | Date} startDate - The date to start the rule from
 * @returns {RRule} RRule that will repeat yearly on the same day of the year as the given start date
 */
export const generateYearlyRRule = startDate => {
  return new RRule({
    freq: RRule.YEARLY,
    dtstart: new Date(startDate),
    interval: 1,
  });
};

export const getNextOccurrence = (rruleOptions, startDate = new Date()) => {
  const rrule = new RRule(rruleOptions);
  const nextOccurrence = rrule.after(startDate, true);
  return nextOccurrence;
};
