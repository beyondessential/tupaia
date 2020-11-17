/**
 * Reports package
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';
import { createAggregator } from '@tupaia/aggregator';
import { Response } from 'express';
import { Aggregator } from '../aggregator';
import { ReportBuilder } from '../reportBuilder';
import { ReportsRequest } from '../types';

class FetchReportRouteHandler {
  private aggregator: Aggregator;

  constructor() {
    this.aggregator = createAggregator(Aggregator);
  }

  fetchReport = async (req: ReportsRequest, res: Response): Promise<void> => {
    const { query, params, models, accessPolicy } = req;
    const report = await models.report.findOne({ code: params.reportCode });
    if (!report) {
      throw new Error(`No report found with code ${params.reportCode}`);
    }

    const orgUnit = await models.entity.findOne({ code: query.organisationUnitCode });
    if (!orgUnit) {
      throw new Error(`No entity found with code ${query.organisationUnitCode}`);
    }
    const permissionGroup = await models.permissionGroup.findById(report.permission_group_id);

    if (!accessPolicy.allows(orgUnit.country_code, permissionGroup.name)) {
      throw new Error(`No ${permissionGroup.name} access for user to ${orgUnit.name}`);
    }
    const reportBuilder = new ReportBuilder(report, this.aggregator, query);
    const data = await reportBuilder.build();
    respond(res, data, 200);
  };
}

export const { fetchReport } = new FetchReportRouteHandler();
