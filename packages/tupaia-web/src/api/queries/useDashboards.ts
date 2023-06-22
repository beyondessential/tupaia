/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { get } from '../api';

export const useDashboards = (projectCode?: string, entityCode?: string) => {
  return useQuery(
    ['dashboards', projectCode, entityCode],
    () =>
      get('dashboards', {
        params: { entityCode, projectCode },
      }),
    { enabled: !!entityCode && !!projectCode },
  );
};
