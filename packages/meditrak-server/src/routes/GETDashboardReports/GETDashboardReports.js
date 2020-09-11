/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { allowNoPermissions, assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertDashboardReportsPermissions,
  filterDashboardReportsByPermissions,
} from './assertDashboardReportsPermissions';
/**
 * Handles endpoints:
 * - /dashboardReport
 * - /dashboardReport/:dashboardReportId
 */
export class GETDashboardReports extends GETHandler {
  async assertUserHasAccess() {
    return true; // all users can request, but results will be filtered according to access
  }

  async findSingleRecord(dashboardReportId, options) {
    const dashboardReport = await super.findSingleRecord(dashboardReportId, options);

    const dashboardReportChecker = accessPolicy =>
      assertDashboardReportsPermissions(accessPolicy, this.models, [dashboardReport]);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dashboardReportChecker]),
    );

    return dashboardReport;
  }

  async findRecords(criteria, options) {
    // ensure the permissions gate check is triggered, actual permissions will be assessed during filtering
    this.assertPermissions(allowNoPermissions);
    const dashboardReports = await this.database.find(this.recordType, criteria, options);
    return filterDashboardReportsByPermissions(this.accessPolicy, this.models, dashboardReports);
  }
}
