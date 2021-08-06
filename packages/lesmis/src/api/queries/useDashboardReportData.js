/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { get } from '../api';
import { useDashboardData } from './useDashboardData';
import { combineQueries } from './utils';
import { QUERY_OPTIONS } from './constants';

export const useDashboardReportData = ({ entityCode, reportCode, startDate, endDate }) => {
  const params = {
    startDate,
    endDate,
    type: 'dashboard',
  };

  const enabled = startDate !== undefined && endDate !== undefined && reportCode !== undefined;

  return useQuery(
    ['dashboardReport', entityCode, reportCode, params],
    () =>
      get(`report/${entityCode}/${reportCode}`, {
        params,
      }),
    { ...QUERY_OPTIONS, keepPreviousData: true, enabled },
  );
};

export const useDashboardReportDataWithConfig = ({
  entityCode,
  reportCode,
  startDate,
  endDate,
}) => {
  const query = combineQueries({
    reportData: useDashboardReportData({ entityCode, reportCode, startDate, endDate }),
    dashboard: useDashboardData({ entityCode }),
  });

  const dashboard = query.data?.dashboard?.find(dash =>
    dash.items.find(item => item.reportCode === reportCode),
  );

  const dashboardItem = dashboard?.items.find(item => item.reportCode === reportCode);

  return {
    ...query,
    data: {
      ...query.data,
      dashboardItemConfig: { ...dashboardItem, dashboardName: dashboard?.dashboardName },
    },
  };
};
