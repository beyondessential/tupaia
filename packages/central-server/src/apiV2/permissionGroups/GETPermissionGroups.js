import { GETHandler } from '../GETHandler';
import { assertAdminPanelAccess, hasBESAdminAccess } from '../../permissions';

export class GETPermissionGroups extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  ancestorsFieldKey = 'ancestors';

  dbQueryColumns = [
    { name: 'permission_group.name' },
    { id: 'permission_group.id' },
    { parent_id: 'permission_group.parent_id' },
  ];

  async assertUserHasAccess() {
    await this.assertPermissions(assertAdminPanelAccess);
  }

  async getPermissionsFilter(dbConditions, dbOptions) {
    if (hasBESAdminAccess(this.accessPolicy)) {
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

  /**
   * Recursive function that gets all the ancestors for a given permission group
   *
   * @param data: the full data set of permission groups
   * @param parentId: a permission group id
   * @param ancestors: the accumulating array of ancestor records
   */
  getAncestors(data, parentId, ancestors) {
    const parent = data.find(x => x.id === parentId);

    if (parent) {
      const newAncestors = [...ancestors, parent];
      return this.getAncestors(data, parent.parent_id, newAncestors);
    }
    return ancestors;
  }

  /**
   * Get all the permission groups so that ancestors can be looked up and attached
   */
  getAllPermissionGroupRecords() {
    return this.database.find(
      this.recordType,
      {},
      {
        columns: this.dbQueryColumns,
      },
    );
  }

  async findRecords(criteria, options) {
    // If ancestors were not requested, return the standard response. Otherwise attach them below
    if (!options.columns.find(column => Object.keys(column).includes(this.ancestorsFieldKey))) {
      return super.findRecords(criteria, options);
    }

    // Manually set the query columns as they need to include the id, name and parent_id and not ancestors
    const records = await super.findRecords(criteria, { ...options, columns: this.dbQueryColumns });
    const data = await this.getAllPermissionGroupRecords();

    return records.map(record => {
      const ancestors = this.getAncestors(data, record.parent_id, []);
      return { ...record, ancestors };
    });
  }
}
