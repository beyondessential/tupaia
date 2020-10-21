/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { allowNoPermissions, assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertDashboardGroupsPermissions,
  createDashboardGroupDBFilter,
} from './assertDashboardGroupsPermissions';
/**
 * Handles endpoints:
 * - /dashboardGroup
 * - /dashboardGroup/:dashboardGroupId
 */
export class GETDashboardGroups extends GETHandler {
  async assertUserHasAccess() {
    return this.assertPermissions(allowNoPermissions); // all users can request, but results will be filtered according to access
  }

  async findSingleRecord(dashboardGroupId, options) {
    const dashboardGroup = await super.findSingleRecord(dashboardGroupId, options);

    const dashboardGroupChecker = accessPolicy =>
      assertDashboardGroupsPermissions(accessPolicy, this.models, dashboardGroupId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dashboardGroupChecker]),
    );

    return dashboardGroup;
  }

  async findRecords(criteria, options) {
    const dbConditions = await createDashboardGroupDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
    );
    const dashboardGroups = await super.findRecords(dbConditions, options);

    return dashboardGroups;
  }
}
