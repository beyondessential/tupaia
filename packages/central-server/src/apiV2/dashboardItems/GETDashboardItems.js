import { UnprocessableContentError } from '@tupaia/utils';
import { processColumnSelectorKeys } from '@tupaia/database';

import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { GETHandler } from '../GETHandler';
import { assertDashboardItemGetPermissions } from './assertDashboardItemsPermissions';
import { createDashboardItemsDBFilter } from './createDashboardItemsDBFilter';

/**
 * Handles endpoints:
 * - GET /dashboardItems
 * - GET /dashboardItems/:dashboardItemId
 * - POST /dashboardItems (Read-only, no creates or updates. Use POST to avoid 414 error.)
 */
export class GETDashboardItems extends GETHandler {
  permissionsFilteredInternally = true;

  getDbQueryCriteria() {
    /** @type {string | undefined} */
    const filterFromQuery = this.req.query.filter; // Handling a GET
    /** @type {object | undefined} */
    const filterFromBody = this.req.body.filter; // Handling a POST

    if (filterFromQuery && filterFromBody) {
      throw new UnprocessableContentError(
        'Must provide `filter` either as a query parameter or in request body, but not both.',
      );
    }

    const filters = filterFromBody ?? (filterFromQuery ? JSON.parse(filterFromQuery) : {});
    return processColumnSelectorKeys(this.models, filters, this.recordType);
  }

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
