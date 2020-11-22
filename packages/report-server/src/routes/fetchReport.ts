/**
 * Reports package
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';
import { createAggregator } from '@tupaia/aggregator';
import { Response } from 'express';
import { Aggregator } from '../aggregator';
import { ReportBuilder } from '../reportBuilder';
import { ReportsRequest } from '../types';

class FetchReportRouteHandler {
  private aggregator: Aggregator;

  constructor() {
    this.aggregator = createAggregator(Aggregator);
  }

  fetchReport = async (req: ReportsRequest, res: Response): Promise<void> => {
    const { query, params, models, accessPolicy, body } = req;
    if (body.testConfig) {
      const reportBuilder = new ReportBuilder(
        body.testConfig,
        this.aggregator,
        query,
        body.testData,
      );
      const data = await reportBuilder.build();
      respond(res, data, 200);
      return;
    }

    const report = await models.report.findOne({ code: params.reportCode });
    if (!report) {
      throw new Error(`No report found with code ${params.reportCode}`);
    }

    const permissionGroup = await models.permissionGroup.findById(report.permission_group_id);
    const orgUnitCodes = query.organisationUnitCodes.split(',');
    const orgUnitsAndCodes = await Promise.all(
      orgUnitCodes.map(async orgUnitCode => ({
        orgUnitCode,
        orgUnit: await models.entity.findOne({ code: orgUnitCode }),
      })),
    );

    const invalidOrgUnit = orgUnitsAndCodes.find(orgUnitAndCode => !orgUnitAndCode.orgUnit);
    if (invalidOrgUnit) {
      throw new Error(`No entity found with code ${invalidOrgUnit.orgUnitCode}`);
    }

    const countryCodes = new Set(
      orgUnitsAndCodes.map(orgUnitAndCode => orgUnitAndCode.orgUnit.country_code),
    );

    countryCodes.forEach(countryCode => {
      if (!accessPolicy.allows(countryCode, permissionGroup.name)) {
        throw new Error(`No ${permissionGroup.name} access for user to ${countryCode}`);
      }
    });

    const reportBuilder = new ReportBuilder(report.config, this.aggregator, query, body.testData);
    const data = await reportBuilder.build();
    respond(res, data, 200);
  };
}

export const { fetchReport } = new FetchReportRouteHandler();
