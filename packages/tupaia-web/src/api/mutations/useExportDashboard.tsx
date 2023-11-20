/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useMutation } from 'react-query';
import { API_URL, post } from '../api';
import { DashboardItem, DashboardName, EntityCode, ProjectCode } from '../../types';

type ExportDashboardBody = {
  projectCode?: ProjectCode;
  entityCode?: EntityCode;
  dashboardCode?: DashboardName;
  selectedDashboardItems?: DashboardItem['code'][];
};

// Requests a dashboard PDF export from the server, and returns the response
export const useExportDashboard = ({ onSuccess }: { onSuccess?: (data: Blob) => void }) => {
  return useMutation<any, Error, ExportDashboardBody, unknown>(
    ({ projectCode, entityCode, dashboardCode, selectedDashboardItems }: ExportDashboardBody) => {
      const baseUrl = `${window.location.protocol}/${window.location.host}`;

      // Auth cookies are saved against this domain. Pass this to server, so that when it pretends to be us, it can do the same.
      const cookieDomain = new URL(API_URL).hostname;

      return post(`dashboards/${projectCode}/${entityCode}/${dashboardCode}/export`, {
        responseType: 'blob',
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
