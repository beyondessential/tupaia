/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { get } from '../api';
import { yearToApiDates } from './utils';

export const useDashboardReportData = ({ entityCode, year, reportId, legacy }) => {
  const { startDate, endDate } = yearToApiDates(year);

  const params = {
    startDate,
    endDate,
    legacy,
    type: 'dashboard', // TODO: Replace this
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
