/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';

import { TYPES } from '@tupaia/database';
import { camelKeys } from '@tupaia/utils';

import { GETHandler } from '../GETHandler';
import { assertBESAdminAccess } from '../../permissions';

const parseCriteria = criteria => {
  const { 'dashboard_visualisation.id': id, 'dashboard_visualisation.code': code } = criteria;
  if (!id && !code) {
    throw new Error('Must specify at least one visualisation id or code');
  }

  return {
    'dashboard_item.id': id,
    'dashboard_item.code': code,
    legacy: false,
  };
};

const buildVisualisationObject = (dashboardItemObject, reportsByCode, permissionGroupsById) => {
  const { model, ...dashboardItem } = dashboardItemObject;
  const report = reportsByCode[dashboardItem.report_code];
  if (!report) {
    throw new Error(`Cannot find a report for visualisation "${dashboardItem.report_code}"`);
  }
  const permissionGroup = permissionGroupsById[report.id]?.name || null;

  return {
    dashboardItem: camelKeys(dashboardItem),
    report: {
      code: report.code,
      config: report.config,
      permissionGroup,
    },
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

    if (dashboardItem.legacy) {
      throw new Error('Cannot fetch a legacy visualisation');
    }

    const [report] = await this.database.find(TYPES.REPORT, {
      code: dashboardItem.report_code,
    });

    if (!report) {
      throw new Error(`Cannot find report "${dashboardItem.report_code}" of the visualisation`);
    }

    const permissionGroup = await this.models.permissionGroup.findById(report.permission_group_id);

    return {
      dashboardItem: camelKeys(dashboardItem),
      report: {
        code: report.code,
        config: report.config,
        permissionGroup: permissionGroup.name,
      },
    };
  }

  async findRecords(inputCriteria) {
    const criteria = parseCriteria(inputCriteria);

    const dashboardItems = await this.models.dashboardItem.find(criteria);
    const reports = await this.models.report.find({
      code: dashboardItems.map(di => di.report_code),
    });
    const reportsByCode = keyBy(reports, 'code');
    const permissionGroups = await this.models.permissionGroup.find({
      id: reports.map(r => r.permission_group_id),
    });
    const permissionGroupsById = keyBy(permissionGroups, 'id');

    return dashboardItems.map(dashboardItem =>
      buildVisualisationObject(dashboardItem, reportsByCode, permissionGroupsById),
    );
  }

  async countRecords(inputCriteria) {
    return this.database.count(TYPES.DASHBOARD_ITEM, parseCriteria(inputCriteria), {
      joinWith: 'report',
      joinCondition: ['dashboard_item.report_code', 'report.code'],
    });
  }
}
