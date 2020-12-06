/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { subtractWeeksFromPeriod } from '../../utils';
import { useTableData } from './useTableData';

const fillWeeklyData = (data, period, numberOfWeeks) => {
  return [...Array(numberOfWeeks)].map((code, index) => {
    const newPeriod = subtractWeeksFromPeriod(period, index);
    const report = data.find(r => r.period === newPeriod);
    return (
      report || {
        period: newPeriod,
      }
    );
  });
};

export const useCountryConfirmedWeeklyReport = (orgUnit, period, numberOfWeeks) => {
  const endWeek = subtractWeeksFromPeriod(period, 1);
  const startWeek = subtractWeeksFromPeriod(period, numberOfWeeks);

  const query = useTableData(`confirmedWeeklyReport/${orgUnit}`, {
    params: { startWeek, endWeek },
  });

  const data = fillWeeklyData(query.data, endWeek, numberOfWeeks);

  return {
    ...query,
    data,
  };
};
