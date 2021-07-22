/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';
import { createAggregator } from '@tupaia/aggregator';
import { Response } from 'express';
import { Aggregator } from '../aggregator';
import { ReportBuilder } from '../reportBuilder';
import { ReportsRequest, FetchReportQuery } from '../types';

const getFilterFromReq = (req: ReportsRequest): FetchReportQuery => {
  const { query, body } = req;
  const { testConfig, testData, ...restOfBody } = body; // remove test fields from the filter
  const filter = { ...query, ...restOfBody };
  return filter;
};

class FetchReportRouteHandler {
  fetchReport = async (req: ReportsRequest, res: Response): Promise<void> => {
    const { params, query, models, accessPolicy, body } = req;
    const filter = getFilterFromReq(req);
    const aggregator = createAggregator(Aggregator, {
      session: { getAuthHeader: () => req.headers.authorization },
    });
    const reportBuilder = new ReportBuilder();
    if (body.testConfig) {
      const { permissionGroup: permissionGroupName } = query;
      if (permissionGroupName) {
        await checkUserHasAccessToReport(
          models,
          accessPolicy,
          permissionGroupName,
          filter.organisationUnitCodes.split(','),
        );
      }
      reportBuilder.setConfig(body.testConfig);
    } else {
      const report = await fetchReportObjectFromDb(models, params.reportCode);
      const permissionGroup = await models.permissionGroup.findById(report.permission_group_id);
      await checkUserHasAccessToReport(
        models,
        accessPolicy,
        permissionGroup.name,
        filter.organisationUnitCodes.split(','),
      );
      reportBuilder.setConfig(report.config);
    }

    if (body.testData) {
      reportBuilder.setTestData(body.testData);
    }

    const data = await reportBuilder.build(aggregator, filter);
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
  permissionGroupName,
  requestedOrgUnitCodes: string[],
) => {
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
};

export const { fetchReport } = new FetchReportRouteHandler();
