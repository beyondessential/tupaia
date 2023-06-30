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
  const { data: dashboards = [], isLoading } = useQuery(
    ['dashboards', projectCode, entityCode],
    (): Promise<DashboardsResponse[]> =>
      get('dashboards', {
        params: { entityCode, projectCode },
      }),
    { enabled: !!entityCode && !!projectCode },
  );

  let activeDashboard = null;

  if (dashboards.length > 0) {
    activeDashboard =
      dashboards.find(
        (dashboard: DashboardsResponse) => dashboard.dashboardName === dashboardName,
      ) || dashboards[0];
  }

  return { dashboards, activeDashboard, isLoading };
};
