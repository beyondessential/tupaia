/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */
import { Moment } from 'moment';
import { useQuery } from 'react-query';
import { get } from '../api';
import { DashboardItemType, EntityCode, ProjectCode, DashboardsResponse } from '../../types';
import { formatDateForApi, getBrowserTimeZone } from '@tupaia/utils';

type QueryParams = Record<string, unknown> & {
  projectCode?: ProjectCode;
  entityCode?: EntityCode;
  dashboardCode?: DashboardsResponse['dashboardCode'];
  itemCode?: DashboardItemType['code'];
  legacy?: DashboardItemType['legacy'];
  startDate?: Moment | string | null;
  endDate?: Moment | string | null;
};

export const useReport = (reportCode: DashboardItemType['reportCode'], params: QueryParams) => {
  const {
    dashboardCode,
    projectCode,
    entityCode,
    itemCode,
    startDate,
    endDate,
    legacy,
    ...rest
  } = params;
  const timeZone = getBrowserTimeZone();
  const formattedStartDate = formatDateForApi(startDate, null);
  const formattedEndDate = formatDateForApi(endDate, null);
  const endPoint = legacy ? 'legacyDashboardReport' : 'report';
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
      ...Object.values(rest),
    ],
    () =>
      get(`${endPoint}/${reportCode}`, {
        params: {
          dashboardCode,
          itemCode,
          projectCode,
          organisationUnitCode: entityCode,
          timeZone,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          ...rest,
        },
      }),
    {
      enabled: !!reportCode && !!dashboardCode && !!projectCode && !!entityCode && !!itemCode,
    },
  );
};
