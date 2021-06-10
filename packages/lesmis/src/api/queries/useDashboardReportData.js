/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { get } from '../api';

export const useDashboardReportData = ({ entityCode, reportId, startDate, endDate, legacy }) => {
  const params = {
    startDate,
    endDate,
    legacy,
    type: 'dashboard',
  };

  return useQuery(
    ['dashboardReport', entityCode, reportId, params],
    () =>
      get(`report/${entityCode}/${reportId}`, {
        params,
      }),
    { staleTime: 60 * 60 * 1000, refetchOnWindowFocus: false, keepPreviousData: true },
  );
};
