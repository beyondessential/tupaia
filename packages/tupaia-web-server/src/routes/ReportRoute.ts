/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';

export type ReportRequest = Request<{ reportCode: string }, any, any, any>;

export class ReportRoute extends Route<ReportRequest> {
  public async buildResponse() {
    const { query, ctx } = this.req;
    const { reportCode } = this.req.params;
    const { legacy, organisationUnitCode, projectCode, startDate, endDate } = query;

    // Legacy data builders are handled through the web config server still
    if (legacy === 'true') {
      return ctx.services.webConfig.fetchReport(reportCode, query);
    }
    // the params for the non-legacy reports are different
    const params = {
      organisationUnitCodes: organisationUnitCode,
      hierarchyName: projectCode,
      startDate,
      endDate,
    };

    const { results } = await ctx.services.report.fetchReport(reportCode, params);

    // format to be the same as the legacy report results, so that the FE can handle accordingly
    const reportData = Array.isArray(results) ? { data: results } : { ...results };

    return {
      ...reportData,
      startDate,
      endDate,
    };
  }
}
