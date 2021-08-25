/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertDashboardEditPermissions } from './assertDashboardsPermissions';

export class DeleteDashboard extends DeleteHandler {
  async assertUserHasAccess() {
    const dashboardChecker = accessPolicy =>
      assertDashboardEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, dashboardChecker]));
  }
}
