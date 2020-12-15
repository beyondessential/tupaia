/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertDashboardGroupsEditPermissions } from './assertDashboardGroupsPermissions';

export class DeleteDashboardGroups extends DeleteHandler {
  async assertUserHasAccess() {
    const mapOverlayChecker = accessPolicy =>
      assertDashboardGroupsEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, mapOverlayChecker]));
  }
}
