/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { UseQueryResult, useQuery } from 'react-query';
import { TupaiaWebDashboardsRequest } from '@tupaia/types';
import { get } from '../api';
import { DashboardName, EntityCode, ProjectCode } from '../../types';

// Returns all dashboards for a project and entity, and also the active dashboard
export const useDashboards = (
  projectCode?: ProjectCode,
  entityCode?: EntityCode,
  dashboardName?: DashboardName,
) => {
  const enabled = !!entityCode && !!projectCode;
  const result = useQuery(
    ['dashboards', projectCode, entityCode],
    (): Promise<TupaiaWebDashboardsRequest.ResBody> =>
      get(`dashboards/${projectCode}/${entityCode}`),
    { enabled, keepPreviousData: false },
  );

  const { data = [] } = result;

  let activeDashboard = undefined;

  if (data?.length > 0 && dashboardName) {
    // trim dashboard name to avoid issues with trailing or leading spaces
    activeDashboard = data?.find(dashboard => dashboard.name.trim() === dashboardName.trim());
  }

  return { ...result, dashboards: data, activeDashboard };
};
