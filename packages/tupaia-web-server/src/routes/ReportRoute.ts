/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';

export type ReportRequest = Request<
  { reportCode: string },
  any,
  any,
  any
>;

export class ReportRoute extends Route<ReportRequest> {
  public async buildResponse() {
    const { query, ctx } = this.req;
    const { reportCode } = this.req.params;
    const { legacy } = query;

    // Legacy data builders are handled through the web config server still
    if (legacy === 'true') {
      return ctx.services.webConfig.fetchReport(reportCode, query);
    }

    return ctx.services.report.fetchReport(reportCode, query);
  }
}
