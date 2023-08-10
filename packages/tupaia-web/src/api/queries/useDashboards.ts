/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
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
  const { data = [], isLoading, isError } = useQuery(
    ['dashboards', projectCode, entityCode],
    (): Promise<TupaiaWebDashboardsRequest.ResBody> =>
      get(`dashboards/${projectCode}/${entityCode}`),
    { enabled, keepPreviousData: enabled },
  );

  let activeDashboard = null;

  if (data?.length > 0 && dashboardName) {
    activeDashboard = data?.find(dashboard => dashboard.name === dashboardName);
  }

  return { dashboards: data, activeDashboard, isLoading, isError };
};
