/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { createAggregator } from '@tupaia/aggregator';
import { Route } from '@tupaia/server-boilerplate';

import { Aggregator } from '../aggregator';
import { ReportBuilder, Row, BuiltReport } from '../reportBuilder';
import { ReportRouteQuery } from './types';

export type TestReportRequest = Request<
  {},
  BuiltReport,
  {
    testData?: Row[];
    testConfig: Record<string, unknown>;
  },
  ReportRouteQuery
>;

export class TestReportRoute extends Route<TestReportRequest> {
  async buildResponse() {
    const { query, ctx, body } = this.req;
    const { organisationUnitCodes, ...restOfQuery } = query;
    if (!organisationUnitCodes || typeof organisationUnitCodes !== 'string') {
      throw new Error('Must provide organisationUnitCodes URL parameter');
    }

    const aggregator = createAggregator(Aggregator, ctx);
    const reportBuilder = new ReportBuilder();
    reportBuilder.setConfig(body.testConfig);
    if (body.testData) {
      reportBuilder.setTestData(body.testData);
    }
    return reportBuilder.build(aggregator, { organisationUnitCodes, ...restOfQuery });
  }
}
