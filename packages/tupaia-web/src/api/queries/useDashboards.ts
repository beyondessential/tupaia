/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { get } from '../api';
import { DashboardName, DashboardsResponse, EntityCode, ProjectCode } from '../../types';

// Returns all dashboards for a project and entity, and also the active dashboard
export const useDashboards = (
  projectCode?: ProjectCode,
  entityCode?: EntityCode,
  dashboardName?: DashboardName,
) => {
  const { data = [], isLoading } = useQuery(
    ['dashboards', projectCode, entityCode],
    (): Promise<DashboardsResponse[]> =>
      get('dashboards', {
        params: { entityCode, projectCode },
      }),
    { enabled: !!entityCode && !!projectCode },
  );

  let activeDashboard = null;

  if (data?.length > 0 && dashboardName) {
    activeDashboard =
      data?.find((dashboard: DashboardsResponse) => dashboard.dashboardName === dashboardName) ||
      data[0];
  }

  return { dashboards: data, activeDashboard, isLoading };
};
