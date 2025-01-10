export const DUE_ISO_DAY = 3; // wednesday

export const REPORT_STATUSES = {
  UPCOMING: 'Upcoming', // The default state of an upcoming report
  OVERDUE: 'Overdue', // Report is not confirmed and date is the week + 1 and after the due day
  SUBMITTED: 'Submitted', // Submitted by site staff. UnConfirmedWeeklyReport record exists
  CONFIRMED: 'Confirmed', // Confirmed by officer. ConfirmedWeeklyReport record exists
  RESUBMIT: 'Resubmit', // Submitted by site staff & confirmed by officer but records do not match. UnConfirmedWeeklyReport and ConfirmedWeeklyReport record exists but they don't match
};

export const MIN_DATE = new Date('2016-01-01');

export const TABLE_STATUSES = {
  STATIC: 'static',
  EDITABLE: 'editable',
  SAVING: 'saving',
  ERROR: 'error',
};
