/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { RRule } from 'rrule';
import { isLastDayOfMonth } from 'date-fns';

/**
 *
 * @param {Date} startDate
 * @returns {RRule} RRule that will repeat daily from the given start date
 */
export const generateDailyRRule = startDate => {
  return new RRule({
    freq: RRule.DAILY,
    dtstart: startDate,
    interval: 1,
  });
};

/**
 *
 * @param {Date} startDate
 * @returns {RRule} RRule that will repeat weekly on the given days of the week from the given start date
 */
export const generateWeeklyRRule = startDate => {
  return new RRule({
    freq: RRule.WEEKLY,
    dtstart: startDate,
    interval: 1,
  });
};

/**
 *
 * @param {Date} startDate
 * @returns  {RRule} RRule that will repeat monthly on the same day of the month as the given start date
 */
export const generateMonthlyRRule = startDate => {
  const dayOfMonth = startDate.getDate();

  if (dayOfMonth <= 28) {
    return new RRule({
      freq: RRule.MONTHLY,
      dtstart: startDate,
      interval: 1,
      bymonthday: [dayOfMonth],
    });
  }

  // If the day of the month is the last day of the month, return a rule that will be applied to the last day of the month every month
  if (isLastDayOfMonth(startDate)) {
    return new RRule({
      freq: RRule.MONTHLY,
      dtstart: startDate,
      interval: 1,
      bymonthday: [-1],
    });
  }

  // Get the days of the month to check - if the given date is the 30th, this will include 28, 29, 30. If the given date is the 29th, this will include 28, 29
  const bymonthday = dayOfMonth === 30 ? [28, 29, 30] : [28, 29];

  return new RRule({
    freq: RRule.MONTHLY,
    dtstart: startDate,
    interval: 1,
    bymonthday,
    // This will get the last available date from the bymonthday array. For example, if the dayOfMonth is 30, the bymonthday array will be [28, 29, 30] and the bysetpos will be -1, which will get the 30th day of the month if it exists, otherwise the 28th or 29th (for February)
    bysetpos: -1,
  });
};

/**
 *
 * @param {Date} startDate
 * @returns {RRule} RRule that will repeat yearly on the same day of the year as the given start date
 */
export const generateYearlyRRule = startDate => {
  return new RRule({
    freq: RRule.YEARLY,
    dtstart: startDate,
    interval: 1,
  });
};
