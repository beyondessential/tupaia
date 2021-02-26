/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { EditHandler } from '../EditHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertDashboardGroupsEditPermissions } from './assertDashboardGroupsPermissions';

export class EditDashboardGroups extends EditHandler {
  async assertUserHasAccess() {
    const dashboardGroupChecker = accessPolicy =>
      assertDashboardGroupsEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dashboardGroupChecker]),
    );
  }

  async editRecord() {
    await this.updateRecord();
  }

  async validate() {
    // dashboardReport, mapOverlay and dashboardGroup use different id formats and are the only endpoints
    // which need to overwrite the validation functionality
    // TODO remove when this task is done https://github.com/beyondessential/tupaia-backlog/issues/723
    return true;
  }
}
