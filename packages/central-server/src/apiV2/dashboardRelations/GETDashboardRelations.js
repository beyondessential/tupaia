import { fullyQualifyColumnSelector, RECORDS } from '@tupaia/database';

import { GETHandler } from '../GETHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertDashboardGetPermissions } from '../dashboards';
import { assertDashboardItemGetPermissions } from '../dashboardItems';
import { assertDashboardRelationGetPermissions } from './assertDashboardRelationsPermissions';
import {
  createDashboardRelationsDBFilter,
  createDashboardRelationsViaParentDashboardDBFilter,
  createDashboardRelationsViaParentDashboardItemDBFilter,
} from './createDashboardRelationsDBFilter';

/**
 * Handles endpoints:
 * - /dashboardRelations
 * - /dashboardRelations/:dashboardRelationId
 */
export class GETDashboardRelations extends GETHandler {
  permissionsFilteredInternally = true;

  customJoinConditions = {
    dashboard: {
      nearTableKey: 'dashboard_relation.dashboard_id',
      farTableKey: 'dashboard.id',
    },
    dashboard_item: {
      nearTableKey: 'dashboard_relation.child_id',
      farTableKey: 'dashboard_item.id',
    },
  };

  getDbQueryCriteria() {
    const { filter: filterString } = this.req.query;
    const filter = filterString ? JSON.parse(filterString) : {};
    const processedObject = {};
    Object.entries(filter).forEach(([columnSelector, value]) => {
      // We don't want to use the customColumnSelectors for dashboard relations since they are not
      // compatible with the database query so just use fullyQualifyColumnSelector
      processedObject[fullyQualifyColumnSelector(columnSelector, this.recordType)] = value;
    });
    return processedObject;
  }

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
      case RECORDS.DASHBOARD:
        return this.getPermissionsViaParentDashboardFilter(criteria, options);
      case RECORDS.DASHBOARD_ITEM:
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
