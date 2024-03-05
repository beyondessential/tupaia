/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebReportRequest } from '@tupaia/types';

export type ReportRequest = Request<
  TupaiaWebReportRequest.Params,
  TupaiaWebReportRequest.ResBody,
  TupaiaWebReportRequest.ReqBody,
  TupaiaWebReportRequest.ReqQuery
>;

export class ReportRoute extends Route<ReportRequest> {
  public async buildResponse() {
    const { query, ctx, models } = this.req;
    const { reportCode } = this.req.params;
    // TODO: Remove reference to organisationUnitCode => entityCode
    const { organisationUnitCode, projectCode, startDate, endDate, itemCode } = query;

    // the params for the non-legacy reports are different
    const params = {
      organisationUnitCodes: organisationUnitCode,
      hierarchy: projectCode,
      startDate,
      endDate,
    };

    const dashboardItem = await models.dashboardItem.findOne({ code: itemCode });

    const { results } = await ctx.services.report.fetchReport(reportCode, params);

    // format to be the same as the legacy report results, so that the FE can handle accordingly
    const reportData = Array.isArray(results) ? { data: results } : { ...results };

    return {
      ...reportData,
      startDate,
      endDate,
      // return the type of the report so we can use the appropriate report types
      type: dashboardItem?.config?.type,
    };
  }
}
