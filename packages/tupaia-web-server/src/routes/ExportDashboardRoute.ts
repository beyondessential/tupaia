/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebExportDashboardRequest } from '@tupaia/types';
import { downloadPageAsPDF } from '@tupaia/server-utils';
import { stringifyQuery } from '@tupaia/utils';

export type ExportDashboardRequest = Request<
  TupaiaWebExportDashboardRequest.Params,
  TupaiaWebExportDashboardRequest.ResBody,
  TupaiaWebExportDashboardRequest.ReqBody,
  TupaiaWebExportDashboardRequest.ReqQuery
>;

export class ExportDashboardRoute extends Route<ExportDashboardRequest> {
  protected type = 'download' as const;

  public async buildResponse() {
    const { projectCode, entityCode, dashboardName } = this.req.params;
    const { baseUrl, selectedDashboardItems, cookieDomain } = this.req.body;
    const { cookie } = this.req.headers;

    const endpoint = `${projectCode}/${entityCode}/${dashboardName}/pdf-export`;
    const pdfPageUrl = stringifyQuery(baseUrl, endpoint, {
      selectedDashboardItems: selectedDashboardItems?.join(','),
    });

    const buffer = await downloadPageAsPDF(pdfPageUrl, cookie, cookieDomain);
    return { contents: buffer, type: 'application/pdf' };
  }
}
