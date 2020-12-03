/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { useLiveTableQuery } from '../useTableQuery';
import { subtractPeriod } from '../../utils';
import { getISODay } from 'date-fns';

const STATUSES = {
  SUBMITTED: 'Submitted',
  CONFIRMED: 'Confirmed',
  OVERDUE: 'Overdue',
};

const DUE_ISO_DAY = 3; // wednesday

const getDaysRemaining = () => {
  const isoDay = getISODay(new Date());
  return DUE_ISO_DAY - isoDay;
};

const fillWeeklyData = (data, confirmedData, period, numberOfWeeks) => {
  return [...Array(numberOfWeeks)].map((code, index) => {
    const newPeriod = subtractPeriod(period, index);

    let finalReport = {
      period: newPeriod,
      status: STATUSES.OVERDUE,
    };

    const confirmedReport = confirmedData.find(report => report.period === newPeriod);

    if (confirmedReport) {
      finalReport = { ...confirmedReport, status: STATUSES.SUBMITTED };
    } else {
      const report = data.find(report => report.period === newPeriod);

      if (report) {
        let reportStatus = STATUSES.OVERDUE;

        // is overdue unless this is this weeks report and it is before wednesday
        if (newPeriod === period) {
          const daysRemaining = getDaysRemaining();
          if (daysRemaining < 0) {
            reportStatus = STATUSES.SUBMITTED;
          }
        }
        finalReport = { ...report, status: reportStatus };
      }
    }

    return finalReport;
  });
};

export const useCountryWeeklyReport = (orgUnit, period, numberOfWeeks) => {
  const startWeek = subtractPeriod(period, numberOfWeeks - 1);

  const confirmedQuery = useLiveTableQuery(`confirmedWeeklyReport/${orgUnit}`, {
    params: { startWeek, endWeek: period },
  });

  const query = useLiveTableQuery(`weeklyReport/${orgUnit}`, {
    params: { startWeek, endWeek: period },
  });

  const data = fillWeeklyData(query.data, confirmedQuery.data, period, numberOfWeeks);

  return {
    ...query,
    data,
  };
};
