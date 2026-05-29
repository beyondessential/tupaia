import { keyBy } from 'es-toolkit/compat';
import { subtractWeeksFromPeriod } from '../../utils';
import { usePaginatedReport } from './helpers';

/**
 * Fill empty data if required so that every period renders as a row in the table
 * @param data
 * @param period
 * @param numberOfWeeks
 * @returns {[]}
 */
const fillWeeklyData = (data, period, numberOfWeeks) => {
  const reportsByPeriod = keyBy(data, 'period');

  return [...Array(numberOfWeeks)].map((code, index) => {
    const newPeriod = subtractWeeksFromPeriod(period, index);
    return reportsByPeriod[newPeriod] || { period: newPeriod };
  });
};

export const useCountryConfirmedWeeklyReport = (orgUnit, period, numberOfWeeks) => {
  const endWeek = subtractWeeksFromPeriod(period, 1);
  const startWeek = subtractWeeksFromPeriod(period, numberOfWeeks);

  const query = usePaginatedReport(`confirmedWeeklyReport/${orgUnit}`, {
    params: { startWeek, endWeek },
  });

  const data = fillWeeklyData(query.data, endWeek, numberOfWeeks);

  return {
    ...query,
    data,
  };
};
