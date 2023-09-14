/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */
import { Moment } from 'moment';
import { useQuery } from 'react-query';
import { formatDateForApi, getBrowserTimeZone } from '@tupaia/utils';
import { TupaiaWebReportRequest } from '@tupaia/types';
import { get } from '../api';
import { DashboardItem, EntityCode, ProjectCode } from '../../types';

type QueryParams = Record<string, unknown> & {
  projectCode?: ProjectCode;
  entityCode?: EntityCode;
  dashboardCode?: DashboardItem['code'];
  itemCode?: DashboardItem['code'];
  legacy?: DashboardItem['legacy'];
  startDate?: Moment | string | null;
  endDate?: Moment | string | null;
  isExpanded?: boolean;
};

export const useReport = (reportCode: DashboardItem['reportCode'], params: QueryParams) => {
  const {
    dashboardCode,
    projectCode,
    entityCode,
    itemCode,
    startDate,
    endDate,
    legacy,
    isExpanded,
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
      isExpanded,
      ...Object.values(rest),
    ],
    (): Promise<TupaiaWebReportRequest.ResBody> =>
      get(`${endPoint}/${reportCode}`, {
        params: {
          dashboardCode,
          itemCode,
          projectCode,
          organisationUnitCode: entityCode,
          timeZone,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          isExpanded,
          ...rest,
        },
      }),
    {
      enabled: !!reportCode && !!dashboardCode && !!projectCode && !!entityCode && !!itemCode,
    },
  );
};
