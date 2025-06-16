import { GETHandler } from '../GETHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertDashboardItemGetPermissions } from './assertDashboardItemsPermissions';
import { createDashboardItemsDBFilter } from './createDashboardItemsDBFilter';
import winston from '../../log';
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

    const dashboardItem = await super.findSingleRecord(dashboardItemId, options);
    return dashboardItem;
  }

  async getPermissionsFilter(criteria, options) {
    winston.debug(
      `[GETDashboardItems#getPermissionsFilter] criteria: ${JSON.stringify(criteria)}}]`,
    );
    const dbConditions = await createDashboardItemsDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
    );
    winston.debug(
      `[GETDashboardItems#getPermissionsFilter] returning: ${JSON.stringify({ dbConditions, dbOptions: options })}}]`,
    );

    return { dbConditions, dbOptions: options };
  }
}
