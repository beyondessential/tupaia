/**
 * Reports package
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';
import { createAggregator } from '@tupaia/aggregator';
import { Response } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';
import { Aggregator } from '../aggregator';
import { BuildReport, ReportBuilder } from '../reportBuilder';
import { ReportsRequest } from '../types';

export interface FetchReportQuery extends Query {
  organisationUnitCode: string;
  period?: string;
}

export interface FetchReportParams extends ParamsDictionary {
  reportCode: string;
}

class FetchReportRouteHandler {
  private aggregator: Aggregator;

  constructor() {
    this.aggregator = createAggregator(Aggregator);
  }

  fetchReport = async (req: ReportsRequest, res: Response): Promise<void> => {
    const params = req.params as FetchReportParams;
    const query = req.query as FetchReportQuery;
    const report = await req.models.report.findOne({ code: params.reportCode });
    if (!report) {
      throw new Error(`No report found with code ${params.reportCode}`);
    }

    const orgUnit = await req.models.entity.findOne({ code: query.organisationUnitCode });
    if (!orgUnit) {
      throw new Error(`No entity found with code ${query.organisationUnitCode}`);
    }
    const permissionGroup = await req.models.permissionGroup.findById(report.permission_group_id);

    if (!req.accessPolicy.allows(orgUnit.country_code, permissionGroup.name)) {
      throw new Error(`No ${permissionGroup.name} access for user to ${orgUnit.name}`);
    }
    const reportBuilder: ReportBuilder = new ReportBuilder(report, this.aggregator, query);
    const data: BuildReport = await reportBuilder.build();
    respond(res, data, 200);
  };
}

export const fetchReport = new FetchReportRouteHandler().fetchReport;
