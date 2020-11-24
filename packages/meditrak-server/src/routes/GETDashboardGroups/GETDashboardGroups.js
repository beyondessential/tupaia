/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertDashboardGroupsPermissions,
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
