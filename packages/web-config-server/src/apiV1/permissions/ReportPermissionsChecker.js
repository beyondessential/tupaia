/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { PermissionsError } from '@tupaia/utils';
import { PermissionsChecker } from './PermissionsChecker';

export class ReportPermissionsChecker extends PermissionsChecker {
  async fetchAndCacheDashboardItem(itemCode) {
    if (!this.dashboardItem) {
      this.dashboardItem = this.models.dashboardItem.findOne({ code: itemCode });
      if (!this.dashboardItem) {
        throw new PermissionsError(`Cannot find dashboard item with code '${itemCode}'`);
      }
    }

    return this.dashboardItem;
  }

  async fetchAndCachePermissionObject() {
    if (!this.permissionObject) {
      const { reportCode } = this.params;
      const { itemCode, dashboardCode } = this.query;
      const dashboardRelation = await this.models.dashboardRelation.findDashboardRelation(
        dashboardCode,
        itemCode,
      );

      if (!dashboardRelation) {
        throw new PermissionsError(
          `Cannot find relation between dashboard '${dashboardCode}' and dashboard item '${itemCode}'`,
        );
      }

      const dashboardItem = await this.fetchAndCacheDashboardItem(itemCode);
      if (reportCode !== dashboardItem.report_code) {
        throw new PermissionsError(
          `Report code '${reportCode}' does not match with report_code '${dashboardItem.report_code}' of dashboard_item '${itemCode}'`,
        );
      }

      const {
        permission_groups: permissionGroups,
        entity_types: entityTypes,
        project_codes: projectCodes,
      } = dashboardRelation;

      this.permissionObject = {
        permissionGroups,
        entityTypes,
        projectCodes,
      };
    }

    return this.permissionObject;
  }

  async fetchPermissionGroups() {
    const { permissionGroups } = await this.fetchAndCachePermissionObject();
    return permissionGroups;
  }

  async checkPermissions() {
    const { itemCode, dashboardCode } = this.query;
    await super.checkPermissions();

    const { entityTypes, projectCodes } = await this.fetchAndCachePermissionObject();

    if (!entityTypes.includes(this.entity.type)) {
      throw new PermissionsError(
        `Entity type '${
          this.entity.type
        }' is not in the allowed types (${entityTypes.toString()}) specified in the relation between dashboard '${dashboardCode}' and dashboard item '${itemCode}')`,
      );
    }

    if (!projectCodes.includes(this.project.code)) {
      throw new PermissionsError(
        `Project '${
          this.project.code
        }' is not in the allowed types (${projectCodes.toString()}) specified in the relation between dashboard '${dashboardCode}' and dashboard item '${itemCode}')`,
      );
    }

    const hasEntityAccess = await this.checkHasEntityAccess(this.entity.code);
    if (!this.entity.isProject() && !hasEntityAccess) {
      throw new PermissionsError(
        `Dashboard with the code '${dashboardCode}' is not allowed for entity '${this.entity.code}'`,
      );
    }

    return true;
  }
}
