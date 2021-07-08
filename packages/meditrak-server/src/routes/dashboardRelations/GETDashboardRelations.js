/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertDashboardRelationGetPermissions,
  createDashboardRelationsDBFilter,
  createDashboardRelationsViaParentDashboardDBFilter,
} from './assertDashboardRelationsPermissions';
import { assertDashboardGetPermissions } from '../dashboards';

/**
 * Handles endpoints:
 * - /dashboardRelations
 * - /dashboardRelations/:dashboardRelationId
 */
export class GETDashboardRelations extends GETHandler {
  permissionsFilteredInternally = true;

  customJoinConditions = {
    dashboard: ['dashboard.id', 'dashboard_relation.dashboard_id'],
    dashboard_item: ['dashboard_item.id', 'dashboard_relation.child_id'],
  };

  async findSingleRecord(dashboardRelationId, options) {
    const dashboardRelation = await super.findSingleRecord(dashboardRelationId, options);

    const dashboardRelationChecker = accessPolicy =>
      assertDashboardRelationGetPermissions(accessPolicy, this.models, dashboardRelationId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dashboardRelationChecker]),
    );

    return dashboardRelation;
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = createDashboardRelationsDBFilter(this.accessPolicy, criteria);
    return { dbConditions, dbOptions: options };
  }

  async getPermissionsViaParentFilter(criteria, options) {
    // Check parent permissions
    const dashboardPermissionChecker = accessPolicy =>
      assertDashboardGetPermissions(accessPolicy, this.models, this.parentRecordId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dashboardPermissionChecker]),
    );

    // Get permitted dashboard relations
    return createDashboardRelationsViaParentDashboardDBFilter(
      this.accessPolicy,
      criteria,
      options,
      this.parentRecordId,
    );
  }
}
