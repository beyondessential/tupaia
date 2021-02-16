/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { EditHandler } from '../EditHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertDashboardReportsEditPermissions } from './assertDashboardReportsPermissions';

export class EditDashboardReports extends EditHandler {
  async assertUserHasAccess() {
    const dashboardReportChecker = accessPolicy =>
      assertDashboardReportsEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, dashboardReportChecker]));
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
