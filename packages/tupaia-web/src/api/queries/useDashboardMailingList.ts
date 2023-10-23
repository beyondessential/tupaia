/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { UseQueryResult, useQuery } from 'react-query';
import { TupaiaWebDashboardsRequest } from '@tupaia/types';
import { get } from '../api';

// Returns all dashboards for a project and entity, and also the active dashboard
export const useDashboardMailingList = (
  email: string,
): UseQueryResult => {
  const result = useQuery(
    ['dashboardMailingList', email],
    (): Promise<TupaiaWebDashboardsRequest.ResBody> =>
      get(`dashboardMailingList/${email}`),
  );

  const { data = [] } = result;

  let activeDashboard;

  if (data?.length > 0 && dashboardName) {
    // trim dashboard name to avoid issues with trailing or leading spaces
    activeDashboard = data?.find(dashboard => dashboard.name.trim() === dashboardName.trim());
  }

  return { ...result, dashboards: data, activeDashboard };
};
