/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useMutation } from '@tanstack/react-query';
import { TupaiaWebEmailDashboardRequest } from '@tupaia/types';
import { API_URL, post } from '../api';
import { Dashboard, DashboardItem, EntityCode, ProjectCode } from '../../types';

type EmailDashboardParams = {
  projectCode?: ProjectCode;
  entityCode?: EntityCode;
  dashboardCode?: Dashboard['code'];
  selectedDashboardItems?: DashboardItem['code'][];
  settings?: TupaiaWebEmailDashboardRequest.ReqBody['settings'];
};

// Requests a dashboard export from the server to be mailed to the mailing list
export const useEmailDashboard = ({
  onSuccess,
}: {
  onSuccess?: (result: TupaiaWebEmailDashboardRequest.ResBody) => void;
}) => {
  return useMutation<any, Error, EmailDashboardParams, unknown>(
    ({
      projectCode,
      entityCode,
      dashboardCode,
      selectedDashboardItems,
      settings,
    }: EmailDashboardParams) => {
      const baseUrl = `${window.location.protocol}//${window.location.host}`;

      // Auth cookies are saved against this domain. Pass this to server, so that when it pretends to be us, it can do the same.
      const cookieDomain = new URL(API_URL).hostname;

      return post(`dashboards/${projectCode}/${entityCode}/${dashboardCode}/email`, {
        data: {
          cookieDomain,
          baseUrl,
          selectedDashboardItems,
          settings,
        },
      });
    },
    {
      onSuccess,
    },
  );
};
