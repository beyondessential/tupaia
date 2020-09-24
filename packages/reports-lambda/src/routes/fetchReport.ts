/**
 * Reports package
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';
import { createAggregator } from '@tupaia/aggregator';
import { Aggregator } from '../aggregator';
import { fetch, transform } from '../reportBuilder';
import * as fs from 'fs';
import * as Hjson from 'hjson';

class FetchReportRouteHandler {
  private aggregator: Aggregator;

  constructor() {
    this.aggregator = createAggregator(Aggregator);
  }

  fetchReport = async (req, res): Promise<void> => {
    const { params, query }: { params: object; query: object } = req;
    const { reportId }: { reportId: string } = params;
    const reportsFile: string = fs.readFileSync('reports.hjson', 'utf-8');
    const reports: object = Hjson.parse(reportsFile);
    const report = reports.reports.find(reportFromList => reportFromList.id === reportId);
    const data = await fetch(report.config.fetch, this.aggregator, query);
    data.results = transform(data.results, report.config.transform);
    respond(res, data, 200);
  };
}

export const fetchReport = new FetchReportRouteHandler().fetchReport;
