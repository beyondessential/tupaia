/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { subtractPeriod } from '../../utils';
import { useLiveTableQuery } from '../useTableQuery';

const fillWeeklyData = (data, period, numberOfWeeks) => {
  return [...Array(numberOfWeeks)].map((code, index) => {
    const newPeriod = subtractPeriod(period, index);
    const report = data.find(report => report.period === newPeriod);
    return report
      ? report
      : {
          period: newPeriod,
        };
  });
};

export const useCountryConfirmedWeeklyReport = (orgUnit, period, numberOfWeeks) => {
  const startWeek = subtractPeriod(period, numberOfWeeks - 1);

  const query = useLiveTableQuery(`confirmedWeeklyReport/${orgUnit}`, {
    params: { startWeek, endWeek: period },
  });

  const data = fillWeeklyData(query.data, period, numberOfWeeks);

  return {
    ...query,
    data,
  };
};
