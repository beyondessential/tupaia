/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */
import { Moment } from 'moment';
import { useQuery } from 'react-query';
import { get } from '../api';
import { DashboardReportType, EntityCode, ProjectCode, DashboardsResponse } from '../../types';
import { formatDateForApi, getBrowserTimeZone } from '@tupaia/utils';

type QueryParams = {
  projectCode?: ProjectCode;
  entityCode?: EntityCode;
  dashboardCode?: DashboardsResponse['dashboardCode'];
  itemCode?: DashboardReportType['code'];
  legacy?: DashboardReportType['legacy'];
  startDate?: Moment | string | null;
  endDate?: Moment | string | null;
};

export const useReport = (reportCode: DashboardReportType['reportCode'], params: QueryParams) => {
  const { dashboardCode, projectCode, entityCode, itemCode, startDate, endDate, legacy } = params;
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
