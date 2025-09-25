import { reduceToDictionary } from '@tupaia/utils';
import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class PermissionGroupRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.PERMISSION_GROUP;

  async parent() {
    if (this.parent_id) {
      return this.model.findById(this.parent_id);
    }

    return null;
  }

  async children() {
    return this.model.find({
      parent_id: this.id,
    });
  }

  async getChildTree() {
    const permissionGroupTree = await this.model.database.findWithChildren(
      this.constructor.databaseRecord,
      this.id,
    );
    return Promise.all(
      permissionGroupTree.map(treeItemFields => this.model.generateInstance(treeItemFields)),
    );
  }

  async getAncestors() {
    const permissionGroupTree = await this.model.database.findWithParents(
      this.constructor.databaseRecord,
      this.id,
    );

    return Promise.all(
      permissionGroupTree.map(treeItemFields => this.model.generateInstance(treeItemFields)),
    );
  }
}

export class PermissionGroupModel extends DatabaseModel {
  static syncDirection = SyncDirections.PULL_FROM_CENTRAL;

  get DatabaseRecordClass() {
    return PermissionGroupRecord;
  }

  async getPermissionGroupNameById(permissionGroupIds) {
    const permissionGroups = await this.findManyById(permissionGroupIds);
    return reduceToDictionary(permissionGroups, 'id', 'name');
  }

  async buildSyncLookupQueryDetails() {
    return null;
  }

  async fetchCountryCodesByPermissionGroupId(accessPolicy) {
    const allPermissionGroupsNames = accessPolicy.getPermissionGroups();
    const permissionGroupNameToId = await this.findIdByField('name', allPermissionGroupsNames);
    const countryCodesByPermissionGroupId = Object.fromEntries(
      Object.entries(permissionGroupNameToId).map(([permissionGroupName, permissionGroupId]) => [
        permissionGroupId,
        accessPolicy.getEntitiesAllowed(permissionGroupName),
      ]),
    );
    return countryCodesByPermissionGroupId;
  }
}
