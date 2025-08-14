import { utcMoment } from '@tupaia/tsutils';
import { convertDateRangeToPeriods } from '@tupaia/utils';

export const EARLIEST_DATA_DATE = utcMoment('2017-01-01'); // Tupaia started in 2017
const MAXIMUM_MONTHS_TO_LOOK_BACK = 60; // Last 5 years

/**
 * @deprecated the same function in Utils package returns today as endDate rather than end of the month
 */

// Assemble a default date range using monthly granularity.
export const getDefaultPeriod = () => {
  const minimumStartDate = utcMoment().subtract(MAXIMUM_MONTHS_TO_LOOK_BACK, 'month');
  const startDateToUse =
    EARLIEST_DATA_DATE > minimumStartDate ? EARLIEST_DATA_DATE : minimumStartDate;
  const startDate = startDateToUse.date(1);
  const endDate = utcMoment().endOf('month');

  return convertDateRangeToPeriods(startDate, endDate).join(';');
};
