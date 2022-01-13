/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { createAggregator } from '@tupaia/aggregator';
import { Route } from '@tupaia/server-boilerplate';
import { DataBroker } from '@tupaia/data-broker';

import { ReportServerAggregator } from '../aggregator';
import { ReportBuilder, BuiltReport } from '../reportBuilder';
import { ReportRouteQuery, ReportRouteBody } from './types';
import { parseOrgUnitCodes } from './parseOrgUnitCodes';

export type FetchReportRequest = Request<
  { reportCode: string },
  BuiltReport,
  ReportRouteBody | Record<string, never>,
  ReportRouteQuery
>;

export class FetchReportRoute extends Route<FetchReportRequest> {
  async findReport() {
    const { models, params } = this.req;
    const { reportCode } = params;
    const report = await models.report.findOne({ code: reportCode });
    if (!report) {
      throw new Error(`No report found with code ${reportCode}`);
    }

    return report;
  }

  async buildResponse() {
    const { query, body } = this.req;
    const { organisationUnitCodes, hierarchy = 'explore', ...restOfParams } = { ...query, ...body };

    const report = await this.findReport();
    const permissionGroupName = await report.permissionGroupName();

    const reqContext = {
      hierarchy,
      permissionGroup: permissionGroupName,
      services: this.req.ctx.services,
      accessPolicy: this.req.accessPolicy,
    };

    const reportBuilder = new ReportBuilder(reqContext).setConfig(report.config);
    const reportQuery = {
      organisationUnitCodes: parseOrgUnitCodes(organisationUnitCodes),
      hierarchy,
      ...restOfParams,
    };

    const aggregator = new ReportServerAggregator(createAggregator(new DataBroker(this.req.ctx)));
    return reportBuilder.build(aggregator, reportQuery);
  }
}
