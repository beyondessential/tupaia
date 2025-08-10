import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { TupaiaWebDashboardsRequest } from '@tupaia/types';
import { EntityCode, ProjectCode } from '../../types';
import { get } from '../api';

// Returns all dashboards for a project and entity, and also the active dashboard
export const useDashboards = (
  projectCode?: ProjectCode,
  entityCode?: EntityCode,
  useQueryOptions?: UseQueryOptions<TupaiaWebDashboardsRequest.ResBody>,
) => {
  return useQuery<TupaiaWebDashboardsRequest.ResBody>(
    ['dashboards', projectCode, entityCode],
    () => get(`dashboards/${projectCode}/${entityCode}`),
    {
      ...useQueryOptions,
      enabled: !!projectCode && !!entityCode && (useQueryOptions?.enabled ?? true),
      keepPreviousData: false,
    },
  );
};
