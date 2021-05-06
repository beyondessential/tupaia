/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { get } from '../api';
import { yearToApiDates } from './utils';

export const useDashboardReportData = ({ entityCode, dashboardGroupId, year, reportId }) => {
  const { startDate, endDate } = yearToApiDates(year);

  const params = {
    dashboardGroupId,
    startDate,
    endDate,
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
