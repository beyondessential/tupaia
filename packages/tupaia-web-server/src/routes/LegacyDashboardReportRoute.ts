/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';

export type LegacyDashboardReportRequest = Request<{ reportCode: string }, any, any, any>;

export class LegacyDashboardReportRoute extends Route<LegacyDashboardReportRequest> {
  public async buildResponse() {
    const { query, ctx } = this.req;
    const { reportCode } = this.req.params;

    return ctx.services.webConfig.fetchReport(reportCode, { legacy: true, ...query });
  }
}
