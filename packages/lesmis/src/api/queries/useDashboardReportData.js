/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { roundStartEndDates, formatDateForApi } from '@tupaia/ui-components/lib/chart';
import { get } from '../api';
import { SINGLE_YEAR_GRANULARITY, MIN_DATA_YEAR } from '../../constants';

export const useDashboardReportData = ({ entityCode, dashboardGroupId, year, reportId }) => {
  const currentYear = new Date().getFullYear().toString();
  const startYear = !year || year === 'all' ? MIN_DATA_YEAR : year;
  const endYear = !year || year === 'all' ? currentYear : year;
  const { startDate, endDate } = roundStartEndDates(SINGLE_YEAR_GRANULARITY, startYear, endYear);

  const params = {
    dashboardGroupId,
    startDate: formatDateForApi(startDate),
    endDate: formatDateForApi(endDate),
    type: 'dashboard',
  };

  return useQuery(
    ['dashboardReport', entityCode, reportId, params],
    () =>
      get(`report/${entityCode}/${reportId}`, {
        params,
      }),
    { staleTime: 60 * 60 * 1000, refetchOnWindowFocus: false },
  );
};
