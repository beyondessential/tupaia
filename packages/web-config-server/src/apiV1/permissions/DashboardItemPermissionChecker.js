/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { PermissionsError } from '@tupaia/utils';
import { PermissionsChecker } from './PermissionsChecker';

export class DashboardItemPermissionChecker extends PermissionsChecker {
  async fetchAndCacheDashboardItem() {
    if (!this.item) {
      const { itemCode } = this.query;
      this.item = await this.models.dashboardItem.findOne({ code: itemCode });
    }
    return this.item;
  }

  async fetchPermissionGroups() {
    const item = await this.fetchAndCacheDashboardItem();
    return item.permission_groups;
  }

  async checkPermissions() {
    await super.checkPermissions();
  }
}
