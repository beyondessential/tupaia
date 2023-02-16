/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { createAggregator } from '@tupaia/aggregator';
import { Route } from '@tupaia/server-boilerplate';

import { ReportServerAggregator } from '../aggregator';
import { ReportBuilder, Row, BuiltReport } from '../reportBuilder';
import { ReportRouteQuery, ReportRouteBody } from './types';
import { parseOrgUnitCodes } from './parseOrgUnitCodes';

export type TestReportRequest = Request<
  Record<string, never>,
  BuiltReport,
  {
    testData?: Row[];
    testConfig: Record<string, unknown>;
  } & ReportRouteBody,
  ReportRouteQuery
>;

const BES_DATA_ADMIN_PERMISSION_GROUP_NAME = 'BES Data Admin';

export class TestReportRoute extends Route<TestReportRequest> {
  public async buildResponse() {
    const { query, body } = this.req;
    const { testData, testConfig, ...restOfBody } = body;
    const { hierarchy = 'explore', organisationUnitCodes, ...restOfQuery } = query;

    const reportQuery = {
      hierarchy,
      organisationUnitCodes: parseOrgUnitCodes(organisationUnitCodes),
      ...restOfQuery,
      ...restOfBody,
    };
    const aggregator = new ReportServerAggregator(
      createAggregator(undefined, {
        accessPolicy: this.req.accessPolicy,
        services: this.req.ctx.services,
      }),
    );

    const reqContext = {
      aggregator,
      query: reportQuery,
      hierarchy,
      permissionGroup: BES_DATA_ADMIN_PERMISSION_GROUP_NAME,
      services: this.req.ctx.services,
      accessPolicy: this.req.accessPolicy,
    };
    const reportBuilder = new ReportBuilder(reqContext);
    reportBuilder.setConfig(body.testConfig);

    if (testData) {
      reportBuilder.setTestData(testData);
    }

    return reportBuilder.build();
  }
}
