/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DeleteHandler } from '../DeleteHandler';
import {
  assertAdminPanelAccess,
  assertAnyPermissions,
  assertBESAdminAccess,
} from '../../permissions';
import { createDashboardRelationsDBFilter } from './assertDashboardRelationsPermissions';

const assertUserHasAccessToItem = async (accessPolicy, recordId, models) => {
  assertAdminPanelAccess(accessPolicy);
  const filters = createDashboardRelationsDBFilter(accessPolicy, {
    'dashboard_relation.id': recordId,
  });
  const dashboardRelation = await models.dashboardRelation.findOne(filters);
  if (!dashboardRelation) {
    throw new Error(`Needs to have access to dashboard relation with id ${recordId}`);
  }
  return dashboardRelation;
};
export class DeleteDashboardRelation extends DeleteHandler {
  async assertUserHasAccess() {
    const permissionsChecker = async accessPolicy =>
      assertUserHasAccessToItem(accessPolicy, this.recordId, this.models);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, permissionsChecker]));
  }
}
