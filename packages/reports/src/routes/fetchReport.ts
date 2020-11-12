/**
 * Reports package
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';
import { createAggregator } from '@tupaia/aggregator';
import { Request, Response } from 'express';
import { Aggregator } from '../aggregator';
import { ReportBuilder } from '../reportBuilder';
import { FetchReportQuery, FetchReportParams } from './types';

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
    const data = await reportBuilder.build();
    respond(res, data, 200);
  };
}

export const fetchReport = new FetchReportRouteHandler().fetchReport;
