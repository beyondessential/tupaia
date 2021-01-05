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
}
