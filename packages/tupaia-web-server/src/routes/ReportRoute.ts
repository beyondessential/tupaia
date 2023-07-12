/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { ReportRequest } from '@tupaia/types';
import { Route } from '@tupaia/server-boilerplate';

export class ReportRoute extends Route<ReportRequest> {
  public async buildResponse() {
    const { query, ctx } = this.req;
    const { reportCode } = this.req.params;
    // TODO: Remove reference to organisationUnitCode => entityCode
    const { organisationUnitCode, projectCode, startDate, endDate } = query;

    // the params for the non-legacy reports are different
    const params = {
      organisationUnitCodes: organisationUnitCode,
      hierarchy: projectCode,
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
