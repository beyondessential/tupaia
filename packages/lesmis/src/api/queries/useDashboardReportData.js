/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { getDefaultDates, formatDateForApi } from '@tupaia/ui-components/lib/chart';
import { get } from '../api';

export const useDashboardReportData = ({
  entityCode,
  dashboardGroupId,
  reportId,
  periodGranularity,
  defaultTimePeriod,
}) => {
  const { startDate, endDate } = getDefaultDates({ periodGranularity, defaultTimePeriod });

  const params = {
    dashboardGroupId,
    startDate: formatDateForApi(startDate),
    endDate: formatDateForApi(endDate),
    type: 'dashboard',
  };

  return useQuery(
    ['view', entityCode, reportId, params],
    () =>
      get(`report/${entityCode}/${reportId}`, {
        params,
      }),
    { staleTime: 60 * 60 * 1000, refetchOnWindowFocus: false },
  );
};
