import moment, { Moment } from 'moment';
import { useQuery } from '@tanstack/react-query';
import { formatDateForApi, getBrowserTimeZone } from '@tupaia/utils';
import { TupaiaWebReportRequest } from '@tupaia/types';
import { get } from '../api';
import { DashboardItem, EntityCode, ProjectCode } from '../../types';

interface QueryParams extends Record<string, unknown> {
  projectCode?: ProjectCode;
  entityCode?: EntityCode;
  dashboardCode?: DashboardItem['code'];
  itemCode?: DashboardItem['code'];
  legacy?: DashboardItem['legacy'];
  startDate?: Moment | string | null;
  endDate?: Moment | string | null;
}

export const useReport = (
  reportCode: DashboardItem['reportCode'],
  params: QueryParams,
  enabled = true,
) => {
  const { dashboardCode, projectCode, entityCode, itemCode, startDate, endDate, legacy, ...rest } =
    params;
  const today = moment();
  const endDateToUse = endDate ?? today; // default to today if no end date is provided, so that the default end date is always in the user's timezone, not UTC
  const timeZone = getBrowserTimeZone();
  const formattedStartDate = formatDateForApi(startDate, null);
  const formattedEndDate = formatDateForApi(endDateToUse, null);
  const endPoint = legacy ? 'legacyDashboardReport' : 'report';
  return useQuery<TupaiaWebReportRequest.ResBody>(
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
      enabled,
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
      enabled:
        enabled && !!reportCode && !!dashboardCode && !!projectCode && !!entityCode && !!itemCode,
    },
  );
};
