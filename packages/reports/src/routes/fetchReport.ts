/**
 * Reports package
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';
import { createAggregator } from '@tupaia/aggregator';
import { Aggregator } from '../aggregator';
import { Request, Response } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';
import * as fs from 'fs';
import * as Hjson from 'hjson';
import { BuildReport, ReportBuilder } from '../reportBuilder';

export interface FetchReportQuery extends Query {
  organisationUnitCode: string;
  period?: string;
}

export interface FetchReportParams extends ParamsDictionary {
  reportId: string;
}

class FetchReportRouteHandler {
  private aggregator: Aggregator;

  constructor() {
    this.aggregator = createAggregator(Aggregator);
  }

  fetchReport = async (req: Request, res: Response): Promise<void> => {
    const params = req.params as FetchReportParams;
    const query = req.query as FetchReportQuery;
    const reportId: string = params.reportId;
    const reportsFile: string = fs.readFileSync('reports.hjson', 'utf-8');
    const reports: object = Hjson.parse(reportsFile);
    const report = reports.reports.find(reportFromList => reportFromList.id === reportId);
    const reportBuilder: ReportBuilder = new ReportBuilder(report, this.aggregator, query);
    const data: BuildReport = await reportBuilder.build();
    respond(res, data, 200);
  };
}

export const fetchReport = new FetchReportRouteHandler().fetchReport;
