/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';
import { GETHandler } from '../GETHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertDashboardGetPermissions } from '../dashboards';
import { assertDashboardItemGetPermissions } from '../dashboardItems';
import {
  assertDashboardRelationGetPermissions,
  createDashboardRelationsDBFilter,
  createDashboardRelationsViaParentDashboardDBFilter,
  createDashboardRelationsViaParentDashboardItemDBFilter,
} from './assertDashboardRelationsPermissions';

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

  getPermissionsFilter(criteria, options) {
    const dbConditions = createDashboardRelationsDBFilter(this.accessPolicy, criteria);
    return { dbConditions, dbOptions: options };
  }

  async getPermissionsViaParentFilter(criteria, options) {
    switch (this.parentRecordType) {
      case TYPES.DASHBOARD:
        return this.getPermissionsViaParentDashboardFilter(criteria, options);
      case TYPES.DASHBOARD_ITEM:
        return this.getPermissionsViaParentDashboardItemFilter(criteria, options);
      default:
        throw new Error(`Cannot get dashboard relations for ${this.parentRecordType}`);
    }
  }

  async getPermissionsViaParentDashboardFilter(criteria, options) {
    const parentPermissionChecker = accessPolicy =>
      assertDashboardGetPermissions(accessPolicy, this.models, this.parentRecordId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, parentPermissionChecker]),
    );

    return createDashboardRelationsViaParentDashboardDBFilter(
      this.accessPolicy,
      criteria,
      options,
      this.parentRecordId,
    );
  }

  async getPermissionsViaParentDashboardItemFilter(criteria, options) {
    const parentPermissionChecker = accessPolicy =>
      assertDashboardItemGetPermissions(accessPolicy, this.models, this.parentRecordId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, parentPermissionChecker]),
    );

    return createDashboardRelationsViaParentDashboardItemDBFilter(
      this.accessPolicy,
      criteria,
      options,
      this.parentRecordId,
    );
  }
}
