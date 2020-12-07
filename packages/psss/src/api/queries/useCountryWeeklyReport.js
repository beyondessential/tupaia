/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { useState } from 'react';
import keyBy from 'lodash.keyby';
import isequal from 'lodash.isequal';
import { useTableData } from './useTableData';
import { subtractWeeksFromPeriod } from '../../utils';
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
  const reportsByPeriod = keyBy(unconfirmedData, 'period');
  const confirmedReportsByPeriod = keyBy(confirmedData, 'period');

  return [...Array(numberOfWeeks)].map((code, index) => {
    const currentPeriod = subtractWeeksFromPeriod(period, index);
    const confirmedReport = confirmedReportsByPeriod[currentPeriod];
    const report = reportsByPeriod[currentPeriod];

    if (report) {
      let reportStatus = REPORT_STATUSES.OVERDUE;

      if (confirmedReport) {
        reportStatus = isequal(report, confirmedReport)
          ? REPORT_STATUSES.SUBMITTED
          : REPORT_STATUSES.RESUBMIT;
      }

      return { ...report, status: reportStatus };
    }

    return {
      period: currentPeriod,
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
