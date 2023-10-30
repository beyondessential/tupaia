/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebLegacyDashboardReportRequest } from '@tupaia/types';

export type LegacyDashboardReportRequest = Request<
  TupaiaWebLegacyDashboardReportRequest.Params,
  TupaiaWebLegacyDashboardReportRequest.ResBody,
  TupaiaWebLegacyDashboardReportRequest.ReqBody,
  TupaiaWebLegacyDashboardReportRequest.ReqQuery
>;

export class LegacyDashboardReportRoute extends Route<LegacyDashboardReportRequest> {
  public async buildResponse() {
    const { query, ctx } = this.req;
    const { reportCode } = this.req.params;

    return ctx.services.webConfig.fetchReport(reportCode, {
      legacy: 'true',
      isExpanded: 'true', // Always get the data for expanded reports. The only time there is a difference is when the report is on matrix reports, and we don't show them when not expanded
      ...query,
    });
  }
}
