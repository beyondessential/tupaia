/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { camel } from 'case';
import { mapKeys } from 'lodash';

import { TYPES } from '@tupaia/database';

import { GETHandler } from '../GETHandler';
import { assertBESAdminAccess } from '../../permissions';

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
      dashboardItem: mapKeys(dashboardItem, (_, propertyKey) => camel(propertyKey)),
      report: { code: report.code, config: report.config, permissionGroup: permissionGroup.name },
    };
  }
}
