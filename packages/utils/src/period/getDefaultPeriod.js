import { convertDateRangeToPeriods } from './convertDateRangeToPeriods';
import { utcMoment } from '../datetime';

export const EARLIEST_DATA_DATE_STRING = '2017-01-01'; // Tupaia started in 2017
export const EARLIEST_DATA_DATE = utcMoment(EARLIEST_DATA_DATE_STRING);
const MAXIMUM_MONTHS_TO_LOOK_BACK = 60; // Last 5 years

// Assemble a default date range using monthly granularity.
export const getDefaultPeriod = () => {
  const minimumStartDate = utcMoment().subtract(MAXIMUM_MONTHS_TO_LOOK_BACK, 'month');
  const startDateToUse =
    EARLIEST_DATA_DATE > minimumStartDate ? EARLIEST_DATA_DATE : minimumStartDate;
  const startDate = startDateToUse.date(1);
  const endDate = utcMoment();

  return convertDateRangeToPeriods(startDate, endDate).join(';');
};
