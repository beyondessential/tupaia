/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { get } from '../api';
import { DashboardsResponse } from '../../types';

export const useDashboards = (projectCode?: string, entityCode?: string) => {
  return useQuery(
    ['dashboards', projectCode, entityCode],
    (): Promise<DashboardsResponse[]> =>
      get('dashboards', {
        params: { entityCode, projectCode },
      }),
    { enabled: !!entityCode && !!projectCode },
  );
};
