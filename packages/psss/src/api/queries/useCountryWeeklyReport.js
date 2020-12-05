/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { useTableData } from './useTableData';
import { getDaysRemaining, subtractPeriod } from '../../utils';
import { REPORT_STATUSES } from '../../constants';

/**
 * Get the weekly reports data by combining the un-confirmed and confirmed weekly reports
 * and fill in any missing weeks with empty rows
 *
 * @param unconfirmedData
 * @param confirmedData
 * @param period
 * @param numberOfWeeks
 * @returns []
 */
const getWeeklyReportsData = (unconfirmedData, confirmedData, period, numberOfWeeks) => {
  let currentWeekIsSubmitted = false;

  // Set up array with an extra week and later drop the first or last week based on whether or not currentWeekIsSubmitted
  const reportData = [...Array(numberOfWeeks + 1)].map((code, index) => {
    const newPeriod = subtractPeriod(period, index);

    const confirmedReport = confirmedData.find(report => report.period === newPeriod);

    if (confirmedReport) {
      if (index === 0) {
        currentWeekIsSubmitted = true;
      }
      return { ...confirmedReport, status: REPORT_STATUSES.SUBMITTED };
    }

    const report = unconfirmedData.find(r => r.period === newPeriod);
    if (report) {
      // is overdue unless it is this weeks report and it is before wednesday
      const reportStatus =
        newPeriod === period && getDaysRemaining() > 0
          ? REPORT_STATUSES.SUBMITTED
          : REPORT_STATUSES.OVERDUE;

      return { ...report, status: reportStatus };
    }

    return {
      period: newPeriod,
      status: REPORT_STATUSES.OVERDUE,
    };
  });

  // drop the first or last week based on whether or not currentWeekIsSubmitted
  return currentWeekIsSubmitted ? [...reportData.slice(0, -1)] : [...reportData.slice(1)];
};

export const useCountryWeeklyReport = (orgUnit, period, numberOfWeeks) => {
  const startWeek = subtractPeriod(period, numberOfWeeks);

  const confirmedQuery = useTableData(`confirmedWeeklyReport/${orgUnit}`, {
    params: { startWeek, endWeek: period },
  });

  const query = useTableData(`weeklyReport/${orgUnit}`, {
    params: { startWeek, endWeek: period },
  });

  const data = getWeeklyReportsData(query.data, confirmedQuery.data, period, numberOfWeeks);

  return {
    ...query,
    isLoading: confirmedQuery.isLoading || query.isLoading,
    startWeek,
    data,
  };
};
