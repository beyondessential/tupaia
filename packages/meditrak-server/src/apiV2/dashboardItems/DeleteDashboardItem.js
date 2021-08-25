/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertDashboardItemEditPermissions } from './assertDashboardItemsPermissions';

export class DeleteDashboardItem extends DeleteHandler {
  async assertUserHasAccess() {
    const dashboardItemChecker = accessPolicy =>
      assertDashboardItemEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dashboardItemChecker]),
    );
  }
}
