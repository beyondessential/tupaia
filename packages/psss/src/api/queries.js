/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { useLiveTableQuery } from './useTableQuery';
import { subtractPeriod } from '../utils';

const fillData = (data, period, numberOfWeeks) => {
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

export const useConfirmedWeeklyReport = (period, countryCodes) => {
  const query = useLiveTableQuery('confirmedWeeklyReport', {
    params: { startWeek: period },
  });

  const data = countryCodes.map(code => {
    const report = query.data.find(report => report.organisationUnit === code.toUpperCase());
    return report
      ? report
      : {
          organisationUnit: code.toUpperCase(),
        };
  });

  return {
    ...query,
    data,
  };
};

export const useCountryConfirmedWeeklyReport = (orgUnit, period, numberOfWeeks) => {
  const startWeek = subtractPeriod(period, numberOfWeeks - 1);

  const query = useLiveTableQuery(`confirmedWeeklyReport/${orgUnit}`, {
    params: { startWeek, endWeek: period },
  });

  const data = fillData(query.data, period, numberOfWeeks);

  return {
    ...query,
    data,
  };
};

export const useCountryWeeklyReport = (orgUnit, period, numberOfWeeks) => {
  const startWeek = subtractPeriod(period, numberOfWeeks - 1);

  const query = useLiveTableQuery(`weeklyReport/${orgUnit}`, {
    params: { startWeek, endWeek: period },
  });

  const data = fillData(query.data, period, numberOfWeeks);

  return {
    ...query,
    data,
  };
};
