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

  console.log('use data start date', startDate);
  console.log('end date', endDate);

  return useQuery(
    ['dashboardReport', entityCode, reportId, params],
    () =>
      get(`report/${entityCode}/${reportId}`, {
        params,
      }),
    { staleTime: 60 * 60 * 1000, refetchOnWindowFocus: false },
  );
};
