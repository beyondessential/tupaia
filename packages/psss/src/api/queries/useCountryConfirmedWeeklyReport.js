/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { subtractPeriod } from '../../utils';
import { useTableData } from './useTableData';

const fillWeeklyData = (data, period, numberOfWeeks) => {
  return [...Array(numberOfWeeks)].map((code, index) => {
    const newPeriod = subtractPeriod(period, index);
    const report = data.find(r => r.period === newPeriod);
    return (
      report || {
        period: newPeriod,
      }
    );
  });
};

export const useCountryConfirmedWeeklyReport = (orgUnit, period, numberOfWeeks) => {
  const endWeek = subtractPeriod(period, 1);
  const startWeek = subtractPeriod(period, numberOfWeeks);

  const query = useTableData(`confirmedWeeklyReport/${orgUnit}`, {
    params: { startWeek, endWeek },
  });

  const data = fillWeeklyData(query.data, endWeek, numberOfWeeks);

  return {
    ...query,
    data,
  };
};
