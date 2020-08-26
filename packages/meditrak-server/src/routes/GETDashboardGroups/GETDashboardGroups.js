/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { allowNoPermissions, assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertDashboardGroupsPermissions,
  filterDashboardGroupsByPermissions,
} from './assertDashboardGroupsPermissions';
/**
 * Handles endpoints:
 * - /dashboardGroup
 * - /dashboardGroup/:dashboardGroupId
 */
export class GETDashboardGroups extends GETHandler {
  async assertUserHasAccess() {
    // Is there a way to check they have any permission group that may contain survey responses?
    return this.assertPermissions(allowNoPermissions);
  }

  async findSingleRecord(dashboardGroupId, options) {
    const dashboardGroup = await super.findSingleRecord(dashboardGroupId, options);

    const dashboardGroupChecker = accessPolicy =>
      assertDashboardGroupsPermissions(accessPolicy, this.models, dashboardGroup);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dashboardGroupChecker]),
    );

    return dashboardGroup;
  }

  async findRecords(criteria, options) {
    const dashboardGroups = await this.database.find(this.recordType, criteria, options);

    return filterDashboardGroupsByPermissions(this.req.accessPolicy, this.models, dashboardGroups);
  }
}
