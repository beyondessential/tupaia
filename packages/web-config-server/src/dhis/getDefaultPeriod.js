import { utcMoment } from '@tupaia/utils';
import { convertDateRangeToPeriods } from '@tupaia/dhis-api';

export const EARLIEST_DATA_DATE = utcMoment('2017-05-03'); // First survey submitted to Tupaia
const MAXIMUM_MONTHS_TO_LOOK_BACK = 60; // Last 5 years

// Assemble a default date range using monthly granularity.
export const getDefaultPeriod = () => {
  const minimumStartDate = utcMoment().subtract(MAXIMUM_MONTHS_TO_LOOK_BACK, 'month');
  const startDateToUse =
    EARLIEST_DATA_DATE > minimumStartDate ? EARLIEST_DATA_DATE : minimumStartDate;
  const startDate = startDateToUse.date(1);
  const endDate = utcMoment().endOf('month');

  return convertDateRangeToPeriods(startDate, endDate).join(';');
};
