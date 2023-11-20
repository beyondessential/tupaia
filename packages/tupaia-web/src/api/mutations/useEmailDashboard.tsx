/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useMutation } from 'react-query';
import { API_URL, post } from '../api';
import { Dashboard, DashboardItem, EntityCode, ProjectCode } from '../../types';
import { TupaiaWebEmailDashboardRequest } from '@tupaia/types';

type EmailDashboardParams = {
  projectCode?: ProjectCode;
  entityCode?: EntityCode;
  dashboardCode?: Dashboard['code'];
  selectedDashboardItems?: DashboardItem['code'][];
};

// Requests a dashboard export from the server to be mailed to the mailing list
export const useEmailDashboard = ({
  onSuccess,
}: {
  onSuccess?: (result: TupaiaWebEmailDashboardRequest.ResBody) => void;
}) => {
  return useMutation<any, Error, EmailDashboardParams, unknown>(
    ({ projectCode, entityCode, dashboardCode, selectedDashboardItems }: EmailDashboardParams) => {
      const baseUrl = `${window.location.protocol}/${window.location.host}`;

      // Auth cookies are saved against this domain. Pass this to server, so that when it pretends to be us, it can do the same.
      const cookieDomain = new URL(API_URL).hostname;

      return post(`dashboards/${projectCode}/${entityCode}/${dashboardCode}/email`, {
        data: {
          cookieDomain,
          baseUrl,
          selectedDashboardItems,
        },
      });
    },
    {
      onSuccess,
    },
  );
};
