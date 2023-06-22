/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { useQuery } from 'react-query';
import { get } from '../api';
import { Dashboard, DashboardItemType, EntityCode, ProjectCode } from '../../types';

export const useReport = (
  projectCode?: ProjectCode,
  entityCode?: EntityCode,
  dashboardCode?: Dashboard['code'],
  reportCode?: DashboardItemType['reportCode'],
  itemCode?: DashboardItemType['code'],
  legacy?: DashboardItemType['legacy'],
) => {
  const timeZone = 'Pacific/Aucklane';
  return useQuery(
    ['report', reportCode, dashboardCode, projectCode, entityCode, itemCode],
    () =>
      get(
        `report/${reportCode}?dashboardCode=${dashboardCode}&legacy=${legacy}&itemCode=${itemCode}&projectCode=${projectCode}&organisationUnitCode=${entityCode}&timeZone=${timeZone}`,
        {},
      ),
    {
      enabled: !!reportCode && !!dashboardCode && !!projectCode && !!entityCode,
    },
  );
};
