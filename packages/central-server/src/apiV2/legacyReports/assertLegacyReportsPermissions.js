import { RECORDS } from '@tupaia/database';
import { hasBESAdminAccess } from '../../permissions';
import { hasDashboardItemGetPermissions, hasDashboardItemEditPermissions } from '../dashboardItems';
import { createDashboardRelationsDBFilter } from '../dashboardRelations';
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
      throw new Error(
        `Requires access to all of the dashboard items using this report, and Tupaia Admin Panel access to the connected dashboard's root_entity_code of the dashboard item)`,
      );
    }
  }

  return true;
};

export const createLegacyReportsDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }

  const dbConditions = { ...criteria };

  // Pull the list of dashboard relations we have access to,
  // then pull the legacy reports we have permission to from that
  const permittedRelationConditions = createDashboardRelationsDBFilter(accessPolicy, criteria);
  const permittedLegacyReports = await models.legacyReport.find(
    {
      ...permittedRelationConditions,
      'dashboard_item.legacy': true,
    },
    {
      multiJoin: [
        {
          joinWith: RECORDS.DASHBOARD_ITEM,
          joinCondition: ['dashboard_item.report_code', 'legacy_report.code'],
        },
        {
          joinWith: RECORDS.DASHBOARD_RELATION,
          joinCondition: ['dashboard_relation.child_id', 'dashboard_item.id'],
        },
      ],
    },
  );
  const permittedLegacyReportCodes = permittedLegacyReports.map(r => r.code);

  dbConditions['legacy_report.code'] = mergeFilter(
    permittedLegacyReportCodes,
    dbConditions['legacy_report.code'],
  );

  return dbConditions;
};
