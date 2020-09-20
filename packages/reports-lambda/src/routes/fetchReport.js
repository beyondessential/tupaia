/**
 * Reports package
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';
import { createAggregator } from '@tupaia/aggregator';
import { Aggregator } from '../aggregator';
import { fetch, transform } from '../reportBuilder';
const fs = require('fs');
const Hjson = require('hjson');

class FetchReportRouteHandler {
  constructor() {
    this.aggregator = createAggregator(Aggregator);
  }

  fetchReport = async (req, res) => {
    const { params, query } = req;
    const { reportId } = params;
    const reportsFile = fs.readFileSync('reports.hjson', 'utf-8');
    const reports = Hjson.parse(reportsFile);
    const report = reports.reports.find(reportFromList => reportFromList.id === reportId);
    const data = await fetch(report.config.fetch, this.aggregator, query);
    data.results = transform(data.results, report.config.transform);
    respond(res, data);
  };
}

export const fetchReport = new FetchReportRouteHandler().fetchReport;
