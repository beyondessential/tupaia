/**
 * Reports package
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';
import { createAggregator } from '@tupaia/aggregator';
import { Aggregator } from '../aggregator';
import { Request, Response } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';
import { BuildReport, ReportBuilder } from '../reportBuilder';

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

  fetchReport = async (req: Request, res: Response): Promise<void> => {
    const params = req.params as FetchReportParams;
    const query = req.query as FetchReportQuery;
    const report = await req.models.report.findOne({ code: params.reportCode });
    if (!report) {
      throw new Error(`No report found with code ${params.reportCode}`);
    }
    const reportBuilder: ReportBuilder = new ReportBuilder(report, this.aggregator, query);
    const data: BuildReport = await reportBuilder.build();
    respond(res, data, 200);
  };
}

export const fetchReport = new FetchReportRouteHandler().fetchReport;
