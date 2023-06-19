/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import camelcaseKeys from 'camelcase-keys';
import { useQuery } from 'react-query';
import { get } from '../api';

export const useDashboards = (projectCode?: string, entityCode?: string) => {
  return useQuery(
    ['dashboards', projectCode, entityCode],
    async () => {
      const response = await get('dashboards', {
        params: { organisationUnitCode: entityCode, projectCode },
      });
      return camelcaseKeys(response, { deep: true });
    },
    { enabled: !!entityCode && !!projectCode },
  );
};
