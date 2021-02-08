/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertDashboardReportsEditPermissions } from './assertDashboardReportsPermissions';

export class DeleteDashboardReports extends DeleteHandler {
  async assertUserHasAccess() {
    const mapOverlayChecker = accessPolicy =>
      assertDashboardReportsEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, mapOverlayChecker]));
  }
}
