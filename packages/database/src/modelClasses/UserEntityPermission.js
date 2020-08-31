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

  // used by @tupaia/auth to build legacy access policy for meditrak app v1.7.106 and below
  async fetchCountryPermissionGroups(userId) {
    return this.database.executeSql(
      `
      SELECT permission_group.name as permission_group_name, entity.code as country_code
      FROM user_entity_permission
      JOIN permission_group ON user_entity_permission.permission_group_id = permission_group.id
      JOIN entity ON user_entity_permission.entity_id = entity.id
      WHERE entity.type = 'country'
      AND user_entity_permission.user_id = ?
      `,
      [userId],
    );
  }
}
