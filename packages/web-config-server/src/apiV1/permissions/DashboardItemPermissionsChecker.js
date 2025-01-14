import { PermissionsError } from '@tupaia/utils';
import { ReportPermissionsChecker } from './ReportPermissionsChecker';

export class DashboardItemPermissionsChecker extends ReportPermissionsChecker {
  async fetchAndCachePermissionObject() {
    if (!this.permissionObject) {
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
}
