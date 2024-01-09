/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useMutation } from 'react-query';
import { TupaiaWebExportDashboardRequest } from '@tupaia/types';
import { API_URL, post } from '../api';
import { DashboardName, EntityCode, ProjectCode } from '../../types';

type ExportDashboardBody = {
  projectCode?: ProjectCode;
  entityCode?: EntityCode;
  dashboardCode?: DashboardName;
  selectedDashboardItems?: TupaiaWebExportDashboardRequest.ReqBody['selectedDashboardItems'];
  settings?: TupaiaWebExportDashboardRequest.ReqBody['settings'];
};

// Requests a dashboard PDF export from the server, and returns the response
export const useExportDashboard = ({ onSuccess }: { onSuccess?: (data: Blob) => void }) => {
  return useMutation<any, Error, ExportDashboardBody, unknown>(
    ({
      projectCode,
      entityCode,
      dashboardCode,
      selectedDashboardItems,
      settings,
    }: ExportDashboardBody) => {
      const baseUrl = `${window.location.protocol}//${window.location.host}`;

      // Auth cookies are saved against this domain. Pass this to server, so that when it pretends to be us, it can do the same.
      const cookieDomain = new URL(API_URL).hostname;

      return post(`dashboards/${projectCode}/${entityCode}/${dashboardCode}/export`, {
        responseType: 'blob',
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
