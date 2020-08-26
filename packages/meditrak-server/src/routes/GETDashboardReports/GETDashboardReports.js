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
    // Is there a way to check they have any permission group that may contain survey responses?
    return this.assertPermissions(allowNoPermissions);
  }

  async findSingleRecord(dashboardReportId, options) {
    const dashboardReport = await super.findSingleRecord(dashboardReportId, options);

    const dashboardReportChecker = accessPolicy =>
      assertDashboardReportsPermissions(accessPolicy, this.models, dashboardReport);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dashboardReportChecker]),
    );

    return dashboardReport;
  }

  async findRecords(criteria, options) {
    const dashboardReports = await this.database.find(this.recordType, criteria, options);

    return filterDashboardReportsByPermissions(
      this.req.accessPolicy,
      this.models,
      dashboardReports,
    );
  }
}
