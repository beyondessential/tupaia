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
  async checkUserHasAccessToReport(hierarchy = 'explore', requestedOrgUnitCodes: string[]) {
    const { accessPolicy, ctx } = this.req;

    const foundOrgUnits = await ctx.microServices.entityApi.getEntities(
      hierarchy,
      requestedOrgUnitCodes,
      {
        fields: ['code', 'country_code'],
      },
    );
    const foundOrgUnitCodes = foundOrgUnits.map(orgUnit => orgUnit.code);

    const missingOrgUnitCodes = requestedOrgUnitCodes.filter(
      orgUnitCode => !foundOrgUnitCodes.includes(orgUnitCode),
    );
    if (missingOrgUnitCodes.length > 0) {
      throw new Error(`No entities found with codes ${missingOrgUnitCodes}`);
    }

    const countryCodes = new Set(foundOrgUnits.map(orgUnit => orgUnit.country_code));
    countryCodes.forEach(countryCode => {
      if (
        countryCode === null ||
        !accessPolicy.allows(countryCode, BES_DATA_ADMIN_PERMISSION_GROUP)
      ) {
        throw new Error(`No ${BES_DATA_ADMIN_PERMISSION_GROUP} access for user to ${countryCode}`);
      }
    });
  }

  async buildResponse() {
    const { query, body } = this.req;
    const { testData, testConfig, ...restOfBody } = body;
    const { organisationUnitCodes, hierarchy, ...restOfParams } = { ...query, ...restOfBody };
    if (!organisationUnitCodes) {
      throw new Error('Must provide organisationUnitCodes URL parameter');
    }

    const organisationUnitCodesArray = Array.isArray(organisationUnitCodes)
      ? organisationUnitCodes
      : organisationUnitCodes.split(',');

    await this.checkUserHasAccessToReport(hierarchy, organisationUnitCodesArray);

    const aggregator = createAggregator(Aggregator, this.req.ctx);
    const reportBuilder = new ReportBuilder();
    reportBuilder.setConfig(body.testConfig);
    if (body.testData) {
      reportBuilder.setTestData(body.testData);
    }
    return reportBuilder.build(aggregator, {
      organisationUnitCodes: organisationUnitCodesArray,
      hierarchy,
      ...restOfParams,
    });
  }
}
