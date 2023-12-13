/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary } from '@tupaia/utils';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class PermissionGroupType extends DatabaseType {
  static databaseType = TYPES.PERMISSION_GROUP;

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
      this.constructor.databaseType,
      this.id,
    );
    return Promise.all(
      permissionGroupTree.map(treeItemFields => this.model.generateInstance(treeItemFields)),
    );
  }
}

export class PermissionGroupModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return PermissionGroupType;
  }

  async getPermissionGroupNameById(permissionGroupIds) {
    const permissionGroups = await this.findManyById(permissionGroupIds);
    return reduceToDictionary(permissionGroups, 'id', 'name');
  }
}
