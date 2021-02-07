/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertDashboardGroupsGetPermissions,
  createDashboardGroupDBFilter,
} from './assertDashboardGroupsPermissions';
/**
 * Handles endpoints:
 * - /dashboardGroups
 * - /dashboardGroups/:dashboardGroupId
 */
export class GETDashboardGroups extends GETHandler {
  permissionsFilteredInternally = true;

  async findSingleRecord(dashboardGroupId, options) {
    const dashboardGroup = await super.findSingleRecord(dashboardGroupId, options);

    const dashboardGroupChecker = accessPolicy =>
      assertDashboardGroupsGetPermissions(accessPolicy, this.models, dashboardGroupId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dashboardGroupChecker]),
    );

    return dashboardGroup;
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await createDashboardGroupDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
    );
    return { dbConditions, dbOptions: options };
  }
}
