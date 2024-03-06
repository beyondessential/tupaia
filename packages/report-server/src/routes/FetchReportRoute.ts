/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { Aggregator } from '@tupaia/aggregator';
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
  private async findReport() {
    const { models, params } = this.req;
    const { reportCode } = params;
    const report = await models.report.findOne({ code: reportCode });
    if (!report) {
      throw new Error(`No report found with code ${reportCode}`);
    }

    return report;
  }

  private async findItemType() {
    const { models, query } = this.req;
    const { itemCode } = query;
    if (!itemCode) return null;

    const dashboardItem = await models.dashboardItem.findOne({
      code: itemCode,
    });
    return dashboardItem?.config?.type;
  }

  public async buildResponse() {
    const { query, body } = this.req;
    const {
      organisationUnitCodes,
      itemCode,
      hierarchy = 'explore',
      ...restOfParams
    } = { ...query, ...body };

    const report = await this.findReport();
    const permissionGroupName = await report.permissionGroupName();
    const itemType = await this.findItemType();

    const reportQuery = {
      organisationUnitCodes: parseOrgUnitCodes(organisationUnitCodes),
      hierarchy,
      ...restOfParams,
    };

    const reqContext = {
      query: reportQuery,
      hierarchy,
      permissionGroup: permissionGroupName,
      services: this.req.ctx.services,
      accessPolicy: this.req.accessPolicy,
      aggregator: new ReportServerAggregator(
        new Aggregator(
          new DataBroker({
            accessPolicy: this.req.accessPolicy,
            services: this.req.ctx.services,
          }),
        ),
      ),
    };

    const reportBuilder = new ReportBuilder(reqContext).setConfig(report.config);
    const reportResult = await reportBuilder.build();

    return {
      ...reportResult,
      // add the item type son we can use the appropriate types
      type: itemType,
    };
  }
}
