/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { createAggregator } from '@tupaia/aggregator';
import { Route } from '@tupaia/server-boilerplate';

import { Aggregator } from '../aggregator';
import { ReportBuilder } from '../reportBuilder';
import { ReportOutput } from '../reportBuilder/output';
import { ReportRouteQuery, ReportRouteBody } from './types';
import { getRequestedOrgUnitObjects, getAccessibleOrgUnitCodes } from './helpers';

export type FetchReportRequest = Request<
  { reportCode: string },
  ReportOutput,
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
    if (!organisationUnitCodes) {
      throw new Error('Must provide organisationUnitCodes URL parameter');
    }
    const report = await this.findReport();
    const permissionGroupName = await report.permissionGroupName();

    const foundOrgUnits = await getRequestedOrgUnitObjects(
      hierarchy,
      organisationUnitCodes,
      this.req.ctx.services.entity,
    );

    const accessibleOrgUnitCodes = await getAccessibleOrgUnitCodes(
      permissionGroupName,
      foundOrgUnits,
      this.req.accessPolicy,
    );

    const reqContext = {
      hierarchy,
      services: this.req.ctx.services,
    };
    const reportBuilder = new ReportBuilder(reqContext).setConfig(report.config);
    const reportQuery = {
      organisationUnitCodes: accessibleOrgUnitCodes,
      hierarchy,
      ...restOfParams,
    };

    const aggregator = createAggregator(Aggregator, this.req.ctx);
    return reportBuilder.build(aggregator, reportQuery);
  }
}
