/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';
import { GETHandler } from '../GETHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertDashboardEditPermissions,
  getDashboardsDBFilter,
} from '../dashboards/assertDashboardsPermissions';
import { mergeMultiJoin } from '../utilities';

/**
 * Handles endpoints:
 * - /dashboardMailingListEntries
 * - /dashboardMailingListEntries/:dashboardMailingListEntryId
 * - /dashboardMailingLists/:dashboardMailingListId/dashboardMailingListEntries
 */
export class GETDashboardMailingListEntries extends GETHandler {
  permissionsFilteredInternally = true;

  async findSingleRecord(dashboardMailingListEntryId, options) {
    const dashboardMailingListEntry = await this.models.dashboardMailingListEntry.findById(
      dashboardMailingListEntryId,
    );
    const dashboardMailingList = await this.models.dashboardMailingList.findById(
      dashboardMailingListEntry.dashboard_mailing_list_id,
    );

    // Must have edit permissions to a dashboard to view its mailing list
    const dashboardChecker = accessPolicy =>
      assertDashboardEditPermissions(accessPolicy, this.models, dashboardMailingList.dashboard_id);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, dashboardChecker]));

    return super.findSingleRecord(dashboardMailingListEntryId, options);
  }

  async getPermissionsFilter(criteria, options) {
    // Get all dashboards the user has permission to and join on dashboard_mailing_list
    const dbConditions = await getDashboardsDBFilter(this.accessPolicy, this.models, {});
    const dbOptions = { ...options };
    dbOptions.multiJoin = mergeMultiJoin(
      [
        {
          joinWith: TYPES.DASHBOARD_MAILING_LIST,
          joinCondition: [
            'dashboard_mailing_list_entry.dashboard_mailing_list_id',
            'dashboard_mailing_list.id',
          ],
        },
        {
          joinWith: TYPES.DASHBOARD,
          joinCondition: ['dashboard_mailing_list.dashboard_id', 'dashboard.id'],
        },
      ],
      dbOptions.multiJoin,
    );
    return { dbConditions, dbOptions };
  }

  async getPermissionsViaParentFilter(criteria, options) {
    const { dbConditions, dbOptions } = await this.getPermissionsFilter(criteria, options);
    return {
      dbConditions: { ...dbConditions, 'dashboard_mailing_list.id': this.parentRecordId },
      dbOptions,
    };
  }
}
