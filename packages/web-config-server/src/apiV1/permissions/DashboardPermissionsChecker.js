/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DashboardGroup } from '/models';
import { PermissionsError } from '@tupaia/utils';
import { PermissionsChecker } from './PermissionsChecker';

export class DashboardPermissionsChecker extends PermissionsChecker {
  async checkPermissions() {
    // run standard permission checks against entity
    await super.checkPermissions();

    // get dashboardGroup based on id from db, and check it matches user permissions
    const { dashboardGroupId } = this.query;
    const dashboardGroup = await DashboardGroup.findById(dashboardGroupId);
    if (!dashboardGroup) {
      throw new PermissionsError(`Dashboard group with the id ${dashboardGroupId} does not exist`);
    }

    if (dashboardGroup.organisationLevel !== this.entity.getOrganisationLevel()) {
      throw new PermissionsError(
        `Dashboard group with the id ${dashboardGroupId} does not match organisation level of ${this.entity.code}`,
      );
    }

    try {
      await this.matchUserGroupToOrganisationUnit(dashboardGroup.userGroup);
    } catch (error) {
      throw new PermissionsError(
        `Dashboard group with the id ${dashboardGroupId} is not allowed for entith ${this.entity.code}`,
      );
    }
    await this.matchReportToDashboard(dashboardGroup.dashboardReports);
  }

  // For each report in dashboardReports, find our reportId
  matchReportToDashboard(dashboardReports) {
    const { viewId } = this.query;
    const isReportInDashboard = dashboardReports.some(thisReportId => viewId === thisReportId);
    if (!isReportInDashboard) {
      throw new PermissionsError(`Report ${viewId} does not exist in requested dashboard group`);
    }
  }
}
