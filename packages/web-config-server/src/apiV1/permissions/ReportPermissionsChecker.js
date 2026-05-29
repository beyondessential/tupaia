import { uniq } from 'es-toolkit';

import { PermissionsError } from '@tupaia/utils';
import { PermissionsChecker } from './PermissionsChecker';
import { RECORDS } from '@tupaia/database';

const getMergedProperties = (records, property) => {
  return uniq(records.flatMap(record => record[property]));
};

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

      // We want to ensure that we allow access to all the dashboard items that a user has permission to
      // so get all the the dashboard relations for the dashboard code and item and combine their
      // permission groups, entity types and project codes
      const dashboardRelations = await this.models.dashboardRelation.find(
        {
          'dashboard.code': dashboardCode,
          'dashboard_item.code': itemCode,
        },
        {
          multiJoin: [
            {
              joinWith: RECORDS.DASHBOARD,
              joinCondition: ['dashboard.id', 'dashboard_relation.dashboard_id'],
            },
            {
              joinWith: RECORDS.DASHBOARD_ITEM,
              joinCondition: ['dashboard_item.id', 'dashboard_relation.child_id'],
            },
          ],
        },
      );

      if (dashboardRelations.length === 0) {
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

      const permissionGroups = getMergedProperties(dashboardRelations, 'permission_groups');
      const entityTypes = getMergedProperties(dashboardRelations, 'entity_types');
      const projectCodes = getMergedProperties(dashboardRelations, 'project_codes');

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
