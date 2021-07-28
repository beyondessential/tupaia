/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { createAggregator } from '@tupaia/aggregator';
import { Route } from '@tupaia/server-boilerplate';

import { Aggregator } from '../aggregator';
import { ReportBuilder, BuiltReport } from '../reportBuilder';
import { ReportType } from '../models';
import { ReportRouteQuery, ReportRouteBody } from './types';

export type FetchReportRequest = Request<
  { reportCode: string },
  BuiltReport,
  ReportRouteBody | Record<string, never>,
  ReportRouteQuery
>;

export class FetchReportRoute extends Route<FetchReportRequest> {
  async findReport() {
    const { models, params } = this.req;
    const { reportCode } = params;
    const report = await models.report.findOne({ code: reportCode });
    if (!report) {
      throw new Error(`No report found with code ${reportCode}`);
    }

    return report;
  }

  async checkUserHasAccessToReport(report: ReportType, requestedOrgUnitCodes: string[]) {
    const { models, accessPolicy } = this.req;
    const permissionGroupName = await report.permissionGroupName();

    const foundOrgUnits = await models.entity.find({ code: requestedOrgUnitCodes });
    const foundOrgUnitCodes = foundOrgUnits.map(orgUnit => orgUnit.code);

    const missingOrgUnitCodes = requestedOrgUnitCodes.filter(
      orgUnitCode => !foundOrgUnitCodes.includes(orgUnitCode),
    );
    if (missingOrgUnitCodes.length > 0) {
      throw new Error(`No entities found with codes ${missingOrgUnitCodes}`);
    }

    const countryCodes = new Set(foundOrgUnits.map(orgUnit => orgUnit.country_code));
    countryCodes.forEach(countryCode => {
      if (!accessPolicy.allows(countryCode, permissionGroupName)) {
        throw new Error(`No ${permissionGroupName} access for user to ${countryCode}`);
      }
    });
  }

  async buildResponse() {
    const { query, body } = this.req;
    const { organisationUnitCodes, ...restOfParams } = { ...query, ...body };
    if (!organisationUnitCodes) {
      throw new Error('Must provide organisationUnitCodes URL parameter');
    }
    const report = await this.findReport();

    const organisationUnitCodesArray = Array.isArray(organisationUnitCodes)
      ? organisationUnitCodes
      : organisationUnitCodes.split(',');

    await this.checkUserHasAccessToReport(report, organisationUnitCodesArray);

    const aggregator = createAggregator(Aggregator, {
      session: { getAuthHeader: () => this.req.headers.authorization },
    });
    return new ReportBuilder()
      .setConfig(report.config)
      .build(aggregator, { organisationUnitCodes: organisationUnitCodesArray, ...restOfParams });
  }
}
