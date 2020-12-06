/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { useState } from 'react';
import keyBy from 'lodash.keyby';
import { useTableData } from './useTableData';
import { getDaysRemaining, subtractWeeksFromPeriod } from '../../utils';
import { REPORT_STATUSES } from '../../constants';
import { useUpcomingReport } from './useUpcomingReport';

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
  const reportsByPeriod = keyBy(unconfirmedData, period);
  const confirmedReportsByPeriod = keyBy(confirmedData, period);

  return [...Array(numberOfWeeks)].map((code, index) => {
    const newPeriod = subtractWeeksFromPeriod(period, index);

    const confirmedReport = confirmedReportsByPeriod[newPeriod];
    if (confirmedReport) {
      return { ...confirmedReport, status: REPORT_STATUSES.SUBMITTED };
    }

    const report = reportsByPeriod[newPeriod];
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
};

const DEFAULT_NUMBER_OF_WEEKS = 10;

const usePagination = (period, count) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_NUMBER_OF_WEEKS);
  const pageNum = page + 1;

  const rowsOnLastPage = count % rowsPerPage || rowsPerPage;
  const isLastPage = pageNum * rowsPerPage > count;
  const rowsOnThisPage = isLastPage ? rowsOnLastPage : rowsPerPage;

  const endWeek = subtractWeeksFromPeriod(period, pageNum * rowsPerPage - rowsPerPage);
  const startWeek = subtractWeeksFromPeriod(endWeek, rowsOnThisPage - 1);

  return { startWeek, endWeek, page, setPage, rowsPerPage, rowsOnThisPage, setRowsPerPage };
};

export const useCountryWeeklyReport = (orgUnit, period, count) => {
  const { period: upcomingReportPeriod } = useUpcomingReport(orgUnit);
  const upcomingReportSubmitted = upcomingReportPeriod === period;
  const lastPeriod = subtractWeeksFromPeriod(period, upcomingReportSubmitted ? 1 : 2);

  const {
    startWeek,
    endWeek,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    rowsOnThisPage,
  } = usePagination(lastPeriod, count);

  const confirmedQuery = useTableData(`confirmedWeeklyReport/${orgUnit}`, {
    params: { startWeek, endWeek },
  });

  const query = useTableData(`weeklyReport/${orgUnit}`, {
    params: { startWeek, endWeek },
  });

  const data = getWeeklyReportsData(query.data, confirmedQuery.data, endWeek, rowsOnThisPage);

  return {
    ...query,
    isLoading: confirmedQuery.isLoading || query.isLoading,
    data,
    startWeek,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
  };
};
