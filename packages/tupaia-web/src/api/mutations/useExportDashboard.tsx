/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useMutation } from 'react-query';
import { stringifyQuery } from '@tupaia/utils';
import { post } from '../api';
import { DashboardItem, DashboardName, EntityCode, ProjectCode } from '../../types';

type ExportDashboardBody = {
  projectCode?: ProjectCode;
  entityCode?: EntityCode;
  dashboardName?: DashboardName;
  selectedDashboardItems?: DashboardItem['code'][];
};

// Requests a dashboard PDF export from the server, and returns the response
export const useExportDashboard = ({ onSuccess }: { onSuccess?: (data: Blob) => void }) => {
  return useMutation<any, Error, ExportDashboardBody, unknown>(
    ({ projectCode, entityCode, dashboardName, selectedDashboardItems }: ExportDashboardBody) => {
      const hostname = `${window.location.protocol}/${window.location.host}`;
      const endpoint = `${projectCode}/${entityCode}/${dashboardName}/pdf-export`;
      const pdfPageUrl = stringifyQuery(hostname, endpoint, {
        selectedDashboardItems: selectedDashboardItems?.join(','),
      });
      // Auth cookies are saved against this domain. Pass this to server, so that when it pretends to be us, it can do the same.
      const cookieDomain = new URL(import.meta.env.REACT_APP_TUPAIA_WEB_API_URL).hostname;
      return post('pdf', {
        responseType: 'blob',
        data: {
          cookieDomain,
          pdfPageUrl,
        },
      });
    },
    {
      onSuccess,
    },
  );
};
