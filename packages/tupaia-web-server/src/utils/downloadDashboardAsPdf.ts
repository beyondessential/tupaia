/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { downloadPageAsPDF } from '@tupaia/server-utils';
import { TupaiaWebExportDashboardRequest } from '@tupaia/types';
import { stringifyQuery } from '@tupaia/utils';

export const downloadDashboardAsPdf = (
  projectCode: string,
  entityCode: string,
  dashboardCode: string,
  baseUrl: TupaiaWebExportDashboardRequest.ReqBody['baseUrl'],
  cookie: string,
  cookieDomain: TupaiaWebExportDashboardRequest.ReqBody['cookieDomain'],
  selectedDashboardItems?: TupaiaWebExportDashboardRequest.ReqBody['selectedDashboardItems'],
  settings: TupaiaWebExportDashboardRequest.ReqBody['settings'] = {
    exportWithLabels: false,
    exportWithTable: false,
    separatePagePerItem: true,
  },
) => {
  const endpoint = `${projectCode}/${entityCode}/${dashboardCode}/dashboard-pdf-export`;
  const pdfPageUrl = stringifyQuery(baseUrl, endpoint, {
    selectedDashboardItems: selectedDashboardItems?.join(','),
    settings: JSON.stringify(settings),
  });

  return downloadPageAsPDF(pdfPageUrl, cookie, cookieDomain, false, true);
};
