import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { Aggregator } from '@tupaia/aggregator';
import { DataBroker } from '@tupaia/data-broker';

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

const BES_DATA_ADMIN_PERMISSION_GROUP = 'BES Data Admin';

export class TestReportRoute extends Route<TestReportRequest> {
  public async buildResponse() {
    const { query, body } = this.req;
    const { testData, testConfig, ...restOfBody } = body;
    const {
      hierarchy = 'explore',
      organisationUnitCodes,
      permissionGroup = BES_DATA_ADMIN_PERMISSION_GROUP,
      ...restOfQuery
    } = query;

    const reportQuery = {
      hierarchy,
      organisationUnitCodes: parseOrgUnitCodes(organisationUnitCodes),
      ...restOfQuery,
      ...restOfBody,
    };
    const aggregator = new ReportServerAggregator(
      new Aggregator(
        new DataBroker({
          accessPolicy: this.req.accessPolicy,
          services: this.req.ctx.services,
        }),
      ),
    );

    const reqContext = {
      aggregator,
      query: reportQuery,
      hierarchy,
      permissionGroup,
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
