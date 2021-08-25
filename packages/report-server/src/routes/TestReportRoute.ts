/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { createAggregator } from '@tupaia/aggregator';
import { Route } from '@tupaia/server-boilerplate';

import { Aggregator } from '../aggregator';
import { ReportBuilder, Row, BuiltReport } from '../reportBuilder';
import { ReportRouteQuery, ReportRouteBody } from './types';
import { getRequestedOrgUnitObjects, getAccessibleOrgUnitCodes } from './helpers';

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
  async buildResponse() {
    const { query, body } = this.req;
    const { testData, testConfig, ...restOfBody } = body;
    const { organisationUnitCodes, hierarchy = 'explore', ...restOfParams } = {
      ...query,
      ...restOfBody,
    };
    if (!organisationUnitCodes) {
      throw new Error('Must provide organisationUnitCodes URL parameter');
    }

    const foundOrgUnits = await getRequestedOrgUnitObjects(
      hierarchy,
      organisationUnitCodes,
      this.req.ctx.microServices.entityApi,
    );

    const accessibleOrgUnitCodes = await getAccessibleOrgUnitCodes(
      BES_DATA_ADMIN_PERMISSION_GROUP_NAME,
      foundOrgUnits,
      this.req.accessPolicy,
    );

    const aggregator = createAggregator(Aggregator, this.req.ctx);
    const reportBuilder = new ReportBuilder();
    reportBuilder.setConfig(body.testConfig);
    if (body.testData) {
      reportBuilder.setTestData(body.testData);
    }
    return reportBuilder.build(aggregator, {
      organisationUnitCodes: accessibleOrgUnitCodes,
      hierarchy,
      ...restOfParams,
    });
  }
}
