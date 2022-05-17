/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertDashboardRelationEditPermissions } from './assertDashboardRelationsPermissions';

export class DeleteDashboardRelation extends DeleteHandler {
  async assertUserHasAccess() {
    const dashboardRelationChecker = accessPolicy =>
      assertDashboardRelationEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dashboardRelationChecker]),
    );
  }
}
