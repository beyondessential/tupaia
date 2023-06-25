/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { useQuery } from 'react-query';
import { get } from '../api';
import { DashboardType, DashboardItemType, EntityCode, ProjectCode } from '../../types';
import { getBrowserTimeZone } from '@tupaia/utils';

export const useReport = (
  projectCode?: ProjectCode,
  entityCode?: EntityCode,
  dashboardCode?: DashboardType['code'],
  reportCode?: DashboardItemType['reportCode'],
  itemCode?: DashboardItemType['code'],
  legacy?: DashboardItemType['legacy'],
) => {
  const timeZone = getBrowserTimeZone();
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
