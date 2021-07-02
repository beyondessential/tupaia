/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertDashboardGetPermissions,
  createDashboardsDBFilter,
} from './assertDashboardsPermissions';
/**
 * Handles endpoints:
 * - /dashboards
 * - /dashboards/:dashboardId
 */
export class GETDashboards extends GETHandler {
  permissionsFilteredInternally = true;

  async findSingleRecord(dashboardId, options) {
    const dashboard = await super.findSingleRecord(dashboardId, options);

    const dashboardChecker = accessPolicy =>
      assertDashboardGetPermissions(accessPolicy, this.models, dashboardId);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, dashboardChecker]));

    return dashboard;
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await createDashboardsDBFilter(this.accessPolicy, this.models, criteria);
    return { dbConditions, dbOptions: options };
  }
}
