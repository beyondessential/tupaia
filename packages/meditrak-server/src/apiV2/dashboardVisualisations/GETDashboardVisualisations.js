/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';

import { TYPES } from '@tupaia/database';
import { camelKeys } from '@tupaia/utils';

import { GETHandler } from '../GETHandler';
import { assertBESAdminAccess } from '../../permissions';

const buildReportObject = (report, legacy, permissionGroupsById) => {
  if (legacy) {
    return {
      code: report.code,
      dataBuilder: report.data_builder,
      config: report.data_builder_config,
      dataServices: report.data_services,
    };
  }

  return {
    code: report.code,
    config: report.config,
    permissionGroup: permissionGroupsById[report.permission_group_id]?.name || null,
  };
};

const buildVisualisationObject = (dashboardItemObject, referencedRecords) => {
  const { model, ...dashboardItem } = dashboardItemObject;
  const { reportsByCode, legacyReportsByCode, permissionGroupsById } = referencedRecords;
  const { report_code: reportCode, legacy } = dashboardItem;

  const report = reportsByCode[reportCode] || legacyReportsByCode[reportCode];
  if (!report) {
    throw new Error(`Cannot find a report for visualisation "${dashboardItem.report_code}"`);
  }

  return {
    dashboardItem: camelKeys(dashboardItem),
    report: buildReportObject(report, legacy, permissionGroupsById),
  };
};

const parseCriteria = criteria => {
  const { 'dashboard_visualisation.id': id, 'dashboard_visualisation.code': code } = criteria;
  if (!id && !code) {
    throw new Error('Must specify at least one visualisation id or code');
  }

  return {
    'dashboard_item.id': id,
    'dashboard_item.code': code,
  };
};

/**
 * Handles endpoints:
 * - GET /dashboardVisualisations/:dashboardVisualisationId
 */
export class GETDashboardVisualisations extends GETHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertBESAdminAccess);
  }

  async getDbQueryOptions() {
    return undefined;
  }

  async findSingleRecord(dashboardVisualisationId) {
    const [dashboardItem] = await this.database.find(TYPES.DASHBOARD_ITEM, {
      id: dashboardVisualisationId,
    });

    if (!dashboardItem) {
      throw new Error('Visualisation does not exist');
    }

    const referencedRecords = await this.findReferencedRecords([dashboardItem]);
    return buildVisualisationObject(dashboardItem, referencedRecords);
  }

  async findRecords(inputCriteria) {
    const criteria = parseCriteria(inputCriteria);

    const dashboardItems = await this.models.dashboardItem.find(criteria);
    const referencedRecords = await this.findReferencedRecords(dashboardItems);

    return dashboardItems.map(dashboardItem =>
      buildVisualisationObject(dashboardItem, referencedRecords),
    );
  }

  async findReferencedRecords(dashboardItems) {
    const reports = await this.findReportsByLegacyValue(dashboardItems, false);
    const legacyReports = await this.findReportsByLegacyValue(dashboardItems, true);
    const permissionGroups = await this.models.permissionGroup.find({
      id: reports.map(r => r.permission_group_id).filter(r => !!r),
    });

    return {
      reportsByCode: keyBy(reports, 'code'),
      legacyReportsByCode: keyBy(legacyReports, 'code'),
      permissionGroupsById: keyBy(permissionGroups, 'id'),
    };
  }

  async findReportsByLegacyValue(dashboardItems, legacy) {
    const codes = dashboardItems.filter(di => di.legacy === legacy).map(di => di.report_code);
    return legacy
      ? this.models.legacyReport.find({ code: codes })
      : this.models.report.find({ code: codes });
  }

  async countRecords(inputCriteria) {
    return this.database.count(TYPES.DASHBOARD_ITEM, parseCriteria(inputCriteria), {
      joinWith: 'report',
      joinCondition: ['dashboard_item.report_code', 'report.code'],
    });
  }
}
