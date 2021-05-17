/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { get } from '../api';

export const useDashboardReportData = ({
  entityCode,
  dashboardGroupId,
  reportId,
  startDate,
  endDate,
}) => {
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
    { staleTime: 60 * 60 * 1000, refetchOnWindowFocus: false, keepPreviousData: true },
  );
};
