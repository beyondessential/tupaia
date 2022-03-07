/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from './GETHandler';
import { assertAdminPanelAccess, hasTupaiaAdminPanelAccess } from '../permissions';

export class GETPermissionGroups extends GETHandler {
  permissionsFilteredInternally = true;

  async assertUserHasAccess() {
    await this.assertPermissions(assertAdminPanelAccess);
  }

  async getPermissionsFilter(dbConditions, dbOptions) {
    if (hasTupaiaAdminPanelAccess(this.accessPolicy)) {
      return { dbConditions, dbOptions };
    }

    // If we don't have BES Admin access, add a filter to the SQL query
    const permissionGroupNames = this.accessPolicy.getPermissionGroups();

    return {
      dbConditions: {
        ...dbConditions,
        name: permissionGroupNames,
      },
      dbOptions,
    };
  }
}
