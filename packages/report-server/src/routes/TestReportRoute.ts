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

const findAccessibleOrgUnits = async (
  req: TestReportRequest,
  hierarchy: string,
  orgUnitCodes: string[],
) => {
  const foundOrgUnits = await getRequestedOrgUnitObjects(
    hierarchy,
    orgUnitCodes,
    req.ctx.services.entity,
  );

  return getAccessibleOrgUnitCodes(
    BES_DATA_ADMIN_PERMISSION_GROUP_NAME,
    foundOrgUnits,
    req.accessPolicy,
  );
};

const parseOrgUnitCodes = (query: Record<string, unknown>): string[] => {
  const { organisationUnitCodes } = query;
  if (!organisationUnitCodes) {
    throw new Error('Must provide organisationUnitCodes URL parameter');
  }

  return Array.isArray(organisationUnitCodes)
    ? organisationUnitCodes
    : (organisationUnitCodes as string).split(',');
};

export class TestReportRoute extends Route<TestReportRequest> {
  async buildResponse() {
    const { query, body } = this.req;
    const { testData, testConfig, ...restOfBody } = body;
    const reportQuery = { ...query, ...restOfBody };

    const reportBuilder = new ReportBuilder();
    reportBuilder.setConfig(body.testConfig);

    if (testData) {
      reportBuilder.setTestData(testData);
    } else {
      const { hierarchy = 'explore' } = reportQuery;
      const orgUnitCodes = parseOrgUnitCodes(reportQuery);

      reportQuery.hierarchy = hierarchy;
      reportQuery.organisationUnitCodes = await findAccessibleOrgUnits(
        this.req,
        hierarchy,
        orgUnitCodes,
      );
    }

    const aggregator = createAggregator(Aggregator, this.req.ctx);
    return reportBuilder.build(aggregator, reportQuery);
  }
}
