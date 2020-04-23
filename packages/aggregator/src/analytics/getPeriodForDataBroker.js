import { convertDateRangeToPeriodString, PERIOD_TYPES, momentToPeriod } from '@tupaia/dhis-api';
import { utcMoment } from '@tupaia/utils';
import { AGGREGATION_TYPES } from '../aggregationTypes';

const EARLIEST_DATA_DATE = utcMoment('2017-01-01'); // Tupaia started in 2017

export const getPeriodForDataBroker = (aggregationType, initialPeriod) => {
  // If aggregation type is SUM_PREVIOUS_EACH_DAY we need to fetch data for all time.
  return aggregationType === AGGREGATION_TYPES.SUM_PREVIOUS_EACH_DAY
    ? getAllTimePeriod()
    : initialPeriod;
};

const getAllTimePeriod = () => {
  const startDate = EARLIEST_DATA_DATE.date(1);
  const endDate = utcMoment().endOf('month');
  return {
    startDate: momentToPeriod(startDate, PERIOD_TYPES.MONTH),
    endDate: momentToPeriod(endDate, PERIOD_TYPES.MONTH),
    period: convertDateRangeToPeriodString(startDate, endDate),
  };
};
