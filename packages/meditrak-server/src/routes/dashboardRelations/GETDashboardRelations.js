/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertDashboardRelationGetPermissions,
  createDashboardRelationsDBFilter,
} from './assertDashboardRelationsPermissions';
import { assertDashboardGetPermission } from './assertDashboardsPermissions';

/**
 * Handles endpoints:
 * - /dashboardRelations
 * - /dashboardRelations/:dashboardRelationId
 */
export class GETDashboardRelations extends GETHandler {
  permissionsFilteredInternally = true;

  customJoinConditions = {
    dasboard: ['dashboard.id', 'dashboard_relation.dashboard_id'],
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
    const surveyResponseChecker = accessPolicy =>
      assertDashboardGetPermission(accessPolicy, this.models, this.parentRecordId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyResponseChecker]),
    );

    // Get answers from survey response
    return createAnswerViaSurveyResponseDBFilter(criteria, options, this.parentRecordId);
  }
}
