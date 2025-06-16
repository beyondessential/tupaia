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
    winston.debug(`[GETDashboardItems#findSingleRecord] ID ${dashboardItemId}`);
    winston.debug(`[GETDashboardItems#findSingleRecord] options ${JSON.stringify(options)}`);
    const dashboardItemChecker = accessPolicy =>
      assertDashboardItemGetPermissions(accessPolicy, this.models, dashboardItemId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dashboardItemChecker]),
    );

    const dashboardItem = await super.findSingleRecord(dashboardItemId, options);
    winston.debug(
      `[GETDashboardItems#findSingleRecord] returning dashboard item (code ${dashboardItem?.code})`,
    );
    return dashboardItem;
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
