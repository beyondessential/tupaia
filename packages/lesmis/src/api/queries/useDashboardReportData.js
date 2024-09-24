/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from '@tanstack/react-query';
import { get } from '../api';
import { useDashboardData } from './useDashboardData';
import { combineQueries } from './utils';
import { QUERY_OPTIONS } from './constants';

const useDashboardReportData = ({ entityCode, reportCode, startDate, endDate, itemCode }) => {
  const params = {
    startDate,
    endDate,
    type: 'dashboard',
    itemCode,
  };

  const enabled = startDate !== undefined && endDate !== undefined && !!reportCode && !!itemCode;

  return useQuery(
    ['dashboardReport', entityCode, reportCode, params],
    () =>
      get(`report/${entityCode}/${reportCode}`, {
        params,
      }),
    { ...QUERY_OPTIONS, keepPreviousData: true, enabled },
  );
};

/**
 * Gets a list of reportCodes keyed by dashboardItemCodes
 * @param dashboards
 * @returns {*}
 */
const getReportCodesByCode = dashboards => {
  return dashboards?.reduce((items, dash) => {
    const newItems = {};
    dash.items.forEach(item => {
      newItems[item.code] = item.reportCode;
    });
    return { ...items, ...newItems };
  }, {});
};

export const useDashboardReportDataWithConfig = ({
  entityCode,
  reportCode,
  startDate,
  endDate,
  itemCode,
}) => {
  const query = combineQueries({
    reportData: useDashboardReportData({ entityCode, reportCode, startDate, endDate, itemCode }),
    dashboards: useDashboardData({ entityCode }),
  });

  const dashboard = query.data?.dashboards?.find(dash =>
    dash.items.find(item => item.reportCode === reportCode),
  );

  const dashboardItem = dashboard?.items.find(item => item.reportCode === reportCode);

  const reportCodes = getReportCodesByCode(query.data?.dashboards);

  return {
    ...query,
    data: {
      reportData: query.data?.reportData,
      dashboardItemConfig: {
        ...dashboardItem,
        dashboardName: dashboard?.dashboardName,
        dashboardCode: dashboard?.dashboardCode,
      },
      reportCodes,
    },
  };
};
