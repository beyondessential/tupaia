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
import { useFavouriteDashboardItem } from './useFavouriteDashboardItem';
import { useUser } from './useUser';
import { IS_NOT_FAVOURITE, IDLE, IS_FAVOURITE } from '../../constants';

const useDashboardReportData = ({ entityCode, reportCode, startDate, endDate }) => {
  const params = {
    startDate,
    endDate,
    type: 'dashboard',
  };

  const enabled = startDate !== undefined && endDate !== undefined && !!reportCode;

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

const getFavouriteStatus = (userFavouriteDashboardItems, userId, reportCode) => {
  if (!userId) {
    return IDLE;
  }

  const isFavouriteDashboardItemFound = userFavouriteDashboardItems.find(
    dashboardItemCode => dashboardItemCode === reportCode,
  );

  return isFavouriteDashboardItemFound ? IS_FAVOURITE : IS_NOT_FAVOURITE;
};

export const useDashboardReportDataWithConfig = ({
  entityCode,
  reportCode,
  startDate,
  endDate,
}) => {
  const { userId } = useUser();

  const query = combineQueries({
    reportData: useDashboardReportData({ entityCode, reportCode, startDate, endDate }),
    dashboards: useDashboardData({ entityCode }),
  });
  const favouriteDashboardItems = useFavouriteDashboardItem({ userId })?.data;

  const dashboard = query.data?.dashboards?.find(dash =>
    dash.items.find(item => item.reportCode === reportCode),
  );

  const dashboardItem = dashboard?.items.find(item => item.reportCode === reportCode);

  const reportCodes = getReportCodesByCode(query.data?.dashboards);

  const favouriteStatus = getFavouriteStatus(favouriteDashboardItems, userId, reportCode);

  return {
    ...query,
    data: {
      reportData: query.data?.reportData,
      dashboardItemConfig: {
        ...dashboardItem,
        dashboardName: dashboard?.dashboardName,
        favouriteStatus,
      },
      reportCodes,
    },
  };
};
