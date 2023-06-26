/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { useQuery } from 'react-query';
import { get } from '../api';
import { DashboardType, DashboardItemType, EntityCode, ProjectCode } from '../../types';
import { formatDateForApi, getBrowserTimeZone } from '@tupaia/utils';

type QueryParams = {
  projectCode?: ProjectCode;
  entityCode?: EntityCode;
  dashboardCode?: DashboardType['code'];
  itemCode?: DashboardItemType['code'];
  legacy?: DashboardItemType['legacy'];
  startDate?: string | null;
  endDate?: string | null;
};

export const useReport = (reportCode?: DashboardItemType['reportCode'], params: QueryParams) => {
  const { dashboardCode, projectCode, entityCode, itemCode, startDate, endDate } = params;
  const timeZone = getBrowserTimeZone();
  const formattedStartDate = formatDateForApi(startDate, null);
  const formattedEndDate = formatDateForApi(endDate, null);
  return useQuery(
    [
      'report',
      reportCode,
      dashboardCode,
      projectCode,
      entityCode,
      itemCode,
      formattedStartDate,
      formattedEndDate,
    ],
    () =>
      get(`report/${reportCode}`, {
        params: {
          dashboardCode,
          legacy,
          itemCode,
          projectCode,
          organisationUnitCode: entityCode,
          timeZone,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
      }),
    {
      enabled: !!reportCode && !!dashboardCode && !!projectCode && !!entityCode,
    },
  );
};
