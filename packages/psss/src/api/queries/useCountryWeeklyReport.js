import { useState } from 'react';
import { keyBy } from 'es-toolkit/compat';
import { subtractWeeksFromPeriod, calculateWeekStatus } from '../../utils';
import { REPORT_STATUSES } from '../../constants';
import { usePaginatedReport } from './helpers';
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
const getWeeklyReportData = (unconfirmedData, confirmedData, period, numberOfWeeks) => {
  const reportsByPeriod = keyBy(unconfirmedData, 'period');
  const confirmedReportsByPeriod = keyBy(confirmedData, 'period');

  return [...Array(numberOfWeeks)].map((code, index) => {
    const currentPeriod = subtractWeeksFromPeriod(period, index);
    const confirmedReport = confirmedReportsByPeriod[currentPeriod];
    const report = reportsByPeriod[currentPeriod];

    // return placeholder row if there is no report data
    if (!report) {
      return {
        period: currentPeriod,
        status: REPORT_STATUSES.OVERDUE,
      };
    }

    const status = calculateWeekStatus(report, confirmedReport);
    return { ...report, status };
  });
};

const DEFAULT_NUMBER_OF_WEEKS = 10;

const usePagination = (period, count) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_NUMBER_OF_WEEKS);
  const pageNum = page + 1;

  const rowsOnLastPage = count % rowsPerPage || rowsPerPage;
  const isLastPage = pageNum * rowsPerPage >= count;
  const rowsOnThisPage = isLastPage ? rowsOnLastPage : rowsPerPage;

  const endWeek = subtractWeeksFromPeriod(period, page * rowsPerPage);
  const startWeek = subtractWeeksFromPeriod(endWeek, rowsOnThisPage - 1);

  return { startWeek, endWeek, page, setPage, rowsPerPage, rowsOnThisPage, setRowsPerPage };
};

export const useCountryWeeklyReport = (orgUnit, period, count) => {
  const { period: upcomingReportPeriod } = useUpcomingReport(orgUnit);
  const upcomingReportSubmitted = upcomingReportPeriod === period;
  const lastPeriod = subtractWeeksFromPeriod(period, upcomingReportSubmitted ? 1 : 2);

  const { startWeek, endWeek, page, setPage, rowsPerPage, setRowsPerPage, rowsOnThisPage } =
    usePagination(lastPeriod, count);

  const confirmedQuery = usePaginatedReport(`confirmedWeeklyReport/${orgUnit}`, {
    params: { startWeek, endWeek },
  });

  const query = usePaginatedReport(`weeklyReport/${orgUnit}`, {
    params: { startWeek, endWeek },
  });

  const data = getWeeklyReportData(query.data, confirmedQuery.data, endWeek, rowsOnThisPage);

  return {
    ...query,
    isLoading: confirmedQuery.isLoading || query.isLoading,
    data,
    startWeek,
    endWeek,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
  };
};
