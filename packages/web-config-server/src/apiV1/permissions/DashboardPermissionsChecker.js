/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { PermissionsError } from '@tupaia/utils';
import { PermissionsChecker } from './PermissionsChecker';

export class DashboardPermissionsChecker extends PermissionsChecker {
  async fetchAndCacheDashboardGroup() {
    if (!this.dashboardGroup) {
      // get dashboardGroup based on id from db, and check it matches user permissions
      const { dashboardGroupId } = this.query;
      this.dashboardGroup = await this.models.dashboardGroup.findById(dashboardGroupId);
    }
    return this.dashboardGroup;
  }

  async fetchPermissionGroups() {
    const dashboardGroup = await this.fetchAndCacheDashboardGroup();
    return [dashboardGroup.userGroup];
  }

  async checkPermissions() {
    // run standard permission checks against entity
    await super.checkPermissions();
    const { dashboardGroupId } = this.query;
    const dashboardGroup = await this.fetchAndCacheDashboardGroup();
    if (!dashboardGroup) {
      throw new PermissionsError(`Dashboard group with the id ${dashboardGroupId} does not exist`);
    }

    if (dashboardGroup.organisationLevel !== this.entity.getOrganisationLevel()) {
      throw new PermissionsError(
        `Dashboard group with the id ${dashboardGroupId} does not match organisation level of ${this.entity.code}`,
      );
    }

    const hasEntityAccess = await this.checkHasEntityAccess(this.entity.code);
    if (!this.entity.isProject() && !hasEntityAccess) {
      throw new PermissionsError(
        `Dashboard group with the id ${dashboardGroupId} is not allowed for entity ${this.entity.code}`,
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
