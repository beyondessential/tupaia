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
  dashboardName: string,
  baseUrl: TupaiaWebExportDashboardRequest.ReqBody['baseUrl'],
  cookie: string,
  cookieDomain: TupaiaWebExportDashboardRequest.ReqBody['cookieDomain'],
  selectedDashboardItems?: TupaiaWebExportDashboardRequest.ReqBody['selectedDashboardItems'],
) => {
  const endpoint = `${projectCode}/${entityCode}/${dashboardName}/pdf-export`;
  const pdfPageUrl = stringifyQuery(baseUrl, endpoint, {
    selectedDashboardItems: selectedDashboardItems?.join(','),
  });

  return downloadPageAsPDF(pdfPageUrl, cookie, cookieDomain);
};
