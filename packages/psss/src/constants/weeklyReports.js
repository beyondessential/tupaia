/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const DUE_ISO_DAY = 3; // wednesday

export const REPORT_STATUSES = {
  UPCOMING: 'Upcoming', // The default state of an upcoming report. ConfirmedWeeklyReport record does not exist
  OVERDUE: 'Overdue', // Report is not confirmed and date is the week + 1 and after the due day. ConfirmedWeeklyReport record does not exist
  SUBMITTED: 'Submitted', // Submitted by site staff & confirmed by officer. UnConfirmedWeeklyReport and ConfirmedWeeklyReport record exists and they match
  RESUBMIT: 'Resubmit', // Submitted by site staff & confirmed by officer but records do not match. UnConfirmedWeeklyReport and ConfirmedWeeklyReport record exists but they don't match
};
