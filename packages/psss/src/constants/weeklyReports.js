/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const WEEK_PERIOD_FORMAT = "yyyy'W'II";

export const DUE_ISO_DAY = 3; // wednesday

export const REPORT_STATUSES = {
  UPCOMING: 'Upcoming', // The default state of an upcoming report
  OVERDUE: 'Overdue', // Report is not confirmed and date is the week + 1 and after the due day
  SUBMITTED: 'Submitted', // Submitted by site staff. UnConfirmedWeeklyReport record exists
  CONFIRMED: 'Confirmed', // Confirmed by officer. ConfirmedWeeklyReport record exists
};
