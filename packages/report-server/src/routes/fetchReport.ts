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
    const reportBuilder = new ReportBuilder();
    if (body.testConfig) {
      reportBuilder.setConfig(body.testConfig);
    } else {
      const report = await fetchReportObjectFromDb(models, params.reportCode);
      await checkUserHasAccessToReport(
        models,
        accessPolicy,
        report,
        query.organisationUnitCodes.split(','),
      );
      reportBuilder.setConfig(report.config);
    }

    if (body.testData) {
      reportBuilder.setTestData(body.testData);
    }

    const data = await reportBuilder.build(this.aggregator, query);
    respond(res, data, 200);
  };
}

const fetchReportObjectFromDb = async (models, reportCode: string) => {
  const report = await models.report.findOne({ code: reportCode });
  if (!report) {
    throw new Error(`No report found with code ${reportCode}`);
  }

  return report;
};

const checkUserHasAccessToReport = async (
  models,
  accessPolicy,
  report,
  requestedOrgUnitCodes: string[],
) => {
  const permissionGroup = await models.permissionGroup.findById(report.permission_group_id);

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
    if (!accessPolicy.allows(countryCode, permissionGroup.name)) {
      throw new Error(`No ${permissionGroup.name} access for user to ${countryCode}`);
    }
  });
};

export const { fetchReport } = new FetchReportRouteHandler();
