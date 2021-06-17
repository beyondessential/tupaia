/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { hasBESAdminAccess } from '../../permissions';
import {
  createDashboardItemsDBFilter,
  hasDashboardItemGetPermissions,
  hasDashboardItemEditPermissions,
} from '../dashboardItems';
import { mergeFilter } from '../utilities';

export const assertLegacyReportGetPermissions = async (accessPolicy, models, legacyReportId) => {
  const legacyReport = await models.legacyReport.findById(legacyReportId);
  const dashboardItems = await models.dashboardItem.find({ report_code: legacyReport.code });

  // If the user has GET permission to ANY of the dashboard items in the dashboard,
  // then user has access to view that dashboard
  for (const dashboardItem of dashboardItems) {
    if (await hasDashboardItemGetPermissions(accessPolicy, models, dashboardItem.id)) {
      return true;
    }
  }

  throw new Error('Requires access to one of the dashboard items using this report');
};

export const assertLegacyReportEditPermissions = async (accessPolicy, models, legacyReportId) => {
  const legacyReport = await models.legacyReport.findById(legacyReportId);
  const dashboardItems = await models.dashboardItem.find({ report_code: legacyReport.code });

  // If the user has EDIT permission to ALL of the dashboard items in the dashboard,
  // then user has access to edit that dashboard
  for (const dashboardItem of dashboardItems) {
    if (!(await hasDashboardItemEditPermissions(accessPolicy, models, dashboardItem.id))) {
      throw new Error(`Requires access to all of the dashboard items using this report`);
    }
  }

  return true;
};

export const createLegacyReportsDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }

  const dbConditions = { ...criteria };

  // Pull the list of dashboard items we have access to, then pull the associated legacy reports
  const dashboardItemsConditions = createDashboardItemsDBFilter(accessPolicy);
  const permittedDashboardItems = await models.dashboardItem.find(dashboardItemsConditions);
  const permittedLegacyReportCodes = permittedDashboardItems
    .filter(di => di.legacy && !!di.report_code)
    .map(di => di.report_code);

  dbConditions['legacy_report.code'] = mergeFilter(
    permittedLegacyReportCodes,
    dbConditions['legacy_report.code'],
  );

  return dbConditions;
};
