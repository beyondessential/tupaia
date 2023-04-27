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

  getCustomMultiJoin(multiJoin) {
    let customJoin = multiJoin;
    const parent = customJoin.find(join => join.joinWith === 'parent');
    if (parent) {
      customJoin = customJoin.filter(join => join.joinWith !== 'parent');
      customJoin.push({
        joinWith: 'permission_group',
        joinAs: 'parent',
        joinCondition: ['permission_group.parent_id', 'parent.id'],
        joinType: null,
      });
    }

    return customJoin;
  }

  async findRecords(criteria, options) {
    const multiJoin = this.getCustomMultiJoin(options.multiJoin);
    return super.findRecords(criteria, { ...options, multiJoin });
  }

  async countRecords(criteria, { multiJoin: baseJoin }) {
    const multiJoin = this.getCustomMultiJoin(baseJoin);
    const options = { multiJoin }; // only the join option is required for count
    return this.database.count(this.recordType, criteria, options);
  }
}
