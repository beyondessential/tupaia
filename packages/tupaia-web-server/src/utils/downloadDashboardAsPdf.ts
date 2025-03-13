import { downloadPageAsPdf } from '@tupaia/server-utils';
import { TupaiaWebExportDashboardRequest } from '@tupaia/types';
import { stringifyQuery } from '@tupaia/utils';

export const downloadDashboardAsPdf = async (
  projectCode: string,
  entityCode: string,
  dashboardName: string,
  baseUrl: TupaiaWebExportDashboardRequest.ReqBody['baseUrl'],
  cookie: string,
  cookieDomain: TupaiaWebExportDashboardRequest.ReqBody['cookieDomain'],
  selectedDashboardItems?: TupaiaWebExportDashboardRequest.ReqBody['selectedDashboardItems'],
  settings: TupaiaWebExportDashboardRequest.ReqBody['settings'] = {
    exportWithLabels: false,
    exportWithTable: false,
    exportDescription: null,
    separatePagePerItem: true,
  },
): Promise<Uint8Array> => {
  const endpoint = `${projectCode}/${entityCode}/${dashboardName}/dashboard-pdf-export`;
  const pdfPageUrl = stringifyQuery(baseUrl, endpoint, {
    selectedDashboardItems: selectedDashboardItems?.join(','),
    settings: JSON.stringify(settings),
  });

  return await downloadPageAsPdf({
    cookieDomain,
    includePageNumber: true,
    pdfPageUrl,
    userCookie: cookie,
  });
};
