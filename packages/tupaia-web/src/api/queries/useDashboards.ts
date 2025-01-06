/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from '@tanstack/react-query';
import { TupaiaWebDashboardsRequest } from '@tupaia/types';
import { EntityCode, ProjectCode } from '../../types';
import { get } from '../api';

// Returns all dashboards for a project and entity, and also the active dashboard
export const useDashboards = (projectCode?: ProjectCode, entityCode?: EntityCode) => {
  return useQuery(
    ['dashboards', projectCode, entityCode],
    (): Promise<TupaiaWebDashboardsRequest.ResBody> =>
      get(`dashboards/${projectCode}/${entityCode}`),
    { enabled: !!entityCode && !!projectCode, keepPreviousData: false },
  );
};
