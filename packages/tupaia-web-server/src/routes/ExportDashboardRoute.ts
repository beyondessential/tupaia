/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { Dashboard, TupaiaWebExportDashboardRequest } from '@tupaia/types';
import { downloadDashboardAsPdf } from '../utils';

export type ExportDashboardRequest = Request<
  TupaiaWebExportDashboardRequest.Params,
  TupaiaWebExportDashboardRequest.ResBody,
  TupaiaWebExportDashboardRequest.ReqBody,
  TupaiaWebExportDashboardRequest.ReqQuery
>;

export class ExportDashboardRoute extends Route<ExportDashboardRequest> {
  protected type = 'download' as const;

  public async buildResponse() {
    const { projectCode, entityCode, dashboardCode } = this.req.params;
    const { baseUrl, selectedDashboardItems, cookieDomain } = this.req.body;
    const { cookie } = this.req.headers;

    if (!cookie) {
      throw new Error(`Must have a valid session to export a dashboard`);
    }

    const [dashboard] = (await this.req.ctx.services.central.fetchResources('dashboards', {
      filter: { code: dashboardCode },
      columns: ['name'],
    })) as Pick<Dashboard, 'name'>[];

    if (!dashboard) {
      throw new Error(`Cannot find dashboard with code: ${dashboardCode}`);
    }

    const buffer = await downloadDashboardAsPdf(
      projectCode,
      entityCode,
      dashboard.name,
      baseUrl,
      cookie,
      cookieDomain,
      selectedDashboardItems,
    );
    return { contents: buffer, type: 'application/pdf' };
  }
}
