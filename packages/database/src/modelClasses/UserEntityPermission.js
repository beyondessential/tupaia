/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class UserEntityPermissionType extends DatabaseType {
  static databaseType = TYPES.USER_ENTITY_PERMISSION;

  static joins = [
    {
      fields: {
        code: 'entity_code',
      },
      joinWith: TYPES.ENTITY,
      joinCondition: [`${TYPES.ENTITY}.id`, `${TYPES.USER_ENTITY_PERMISSION}.entity_id`],
    },
    {
      fields: {
        name: 'permission_group_name',
      },
      joinWith: TYPES.PERMISSION_GROUP,
      joinCondition: [
        `${TYPES.PERMISSION_GROUP}.id`,
        `${TYPES.USER_ENTITY_PERMISSION}.permission_group_id`,
      ],
    },
  ];

  async entity() {
    return this.otherModels.entity.findById(this.entity_id);
  }

  async user() {
    return this.otherModels.user.findById(this.user_id);
  }

  async permissionGroup() {
    return this.otherModels.permissionGroup.findById(this.permission_group_id);
  }
}

export class UserEntityPermissionModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return UserEntityPermissionType;
  }
}
