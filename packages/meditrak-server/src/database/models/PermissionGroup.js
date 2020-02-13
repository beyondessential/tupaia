/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class PermissionGroupType extends DatabaseType {
  static databaseType = TYPES.PERMISSION_GROUP;

  static meditrakConfig = {
    minAppVersion: '1.7.86',
  };

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
}
