/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from './GETHandler';
import { assertAdminPanelAccess, hasTupaiaAdminPanelAccess } from '../permissions';

export class GETPermissionGroups extends GETHandler {
  permissionsFilteredInternally = true;

  columns = [
    { name: 'permission_group.name' },
    { id: 'permission_group.id' },
    { parent_id: 'permission_group.parent_id' },
  ];

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

  getAncestors(data, parentId, ancestors) {
    const parent = data.find(x => x.id === parentId);

    if (parent) {
      const newAncestors = [...ancestors, parent];
      return this.getAncestors(data, parent.parent_id, newAncestors);
    }
    return ancestors;
  }

  getAllPermissionGroupRecords() {
    return this.database.find(this.recordType, {}, { columns: this.columns });
  }

  async findRecords(criteria, options) {
    const records = await super.findRecords(criteria, { ...options, columns: this.columns });
    // add check for ancestors
    const data = await this.getAllPermissionGroupRecords();

    return records.map(r => {
      const ancestors = this.getAncestors(data, r.parent_id, []);
      return { ...r, ancestors };
    });
  }
}
