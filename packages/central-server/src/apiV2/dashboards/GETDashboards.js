import { GETHandler } from '../GETHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertDashboardGetPermissions } from './assertDashboardsPermissions';
import { getDashboardsDBFilter } from './getDashboardsDBFilter';
/**
 * Handles endpoints:
 * - /dashboards
 * - /dashboards/:dashboardId
 */
export class GETDashboards extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  async findSingleRecord(dashboardId, options) {
    const dashboard = await super.findSingleRecord(dashboardId, options);

    const dashboardChecker = accessPolicy =>
      assertDashboardGetPermissions(accessPolicy, this.models, dashboardId);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, dashboardChecker]));

    return dashboard;
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await getDashboardsDBFilter(this.accessPolicy, this.models, criteria);
    return { dbConditions, dbOptions: options };
  }
}
