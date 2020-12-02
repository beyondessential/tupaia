/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { useLiveTableQuery } from './useTableQuery';
import { subtractPeriod } from '../utils';

export const useCountryConfirmedWeeklyReport = (orgUnit, startPeriod, endPeriod) => {
  const query = useLiveTableQuery(`confirmedWeeklyReport/${orgUnit}`, {
    params: { startWeek: startPeriod, endWeek: endPeriod },
  });

  const data = [...Array(8)].map((code, index) => {
    const newPeriod = subtractPeriod(endPeriod, index);
    const report = query.data.find(report => report.period === newPeriod);
    return report
      ? report
      : {
          period: newPeriod,
        };
  });

  return {
    ...query,
    data,
  };
};
