import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { GETHandler } from '../GETHandler';
import { assertDashboardItemGetPermissions } from './assertDashboardItemsPermissions';
import { createDashboardItemsDBFilter } from './createDashboardItemsDBFilter';
/**
 * Handles endpoints:
 * - /dashboardItems
 * - /dashboardItems/:dashboardItemId
 */
export class GETDashboardItems extends GETHandler {
  permissionsFilteredInternally = true;

  async findSingleRecord(dashboardItemId, options) {
    const dashboardItemChecker = accessPolicy =>
      assertDashboardItemGetPermissions(accessPolicy, this.models, dashboardItemId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dashboardItemChecker]),
    );

    return await super.findSingleRecord(dashboardItemId, options);
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await createDashboardItemsDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
    );

    return { dbConditions, dbOptions: options };
  }
}
