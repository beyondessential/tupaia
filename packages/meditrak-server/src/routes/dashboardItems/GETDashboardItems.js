/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertDashboardItemGetPermissions,
  createDashboardItemsDBFilter,
} from './assertDashboardItemsPermissions';
/**
 * Handles endpoints:
 * - /dashboardItems
 * - /dashboardItems/:dashboardItemId
 */
export class GETDashboardItems extends GETHandler {
  permissionsFilteredInternally = true;

  async findSingleRecord(dashboardItemId, options) {
    const dashboardItem = await super.findSingleRecord(dashboardItemId, options);

    const dashboardItemChecker = accessPolicy =>
      assertDashboardItemGetPermissions(accessPolicy, this.models, dashboardItemId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dashboardItemChecker]),
    );

    return dashboardItem;
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = createDashboardItemsDBFilter(this.accessPolicy, criteria);
    return { dbConditions, dbOptions: options };
  }
}
