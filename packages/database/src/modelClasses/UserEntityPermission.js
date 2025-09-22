import { ensure } from '@tupaia/tsutils';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class UserEntityPermissionRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.USER_ENTITY_PERMISSION;

  static joins = [
    {
      fields: {
        code: 'entity_code',
      },
      joinWith: RECORDS.ENTITY,
      joinCondition: [`${RECORDS.ENTITY}.id`, `${RECORDS.USER_ENTITY_PERMISSION}.entity_id`],
    },
    {
      fields: {
        name: 'permission_group_name',
      },
      joinWith: RECORDS.PERMISSION_GROUP,
      joinCondition: [
        `${RECORDS.PERMISSION_GROUP}.id`,
        `${RECORDS.USER_ENTITY_PERMISSION}.permission_group_id`,
      ],
    },
  ];

  /**
   * @returns {Promise<import('./Entity').EntityRecord>}
   */
  async entity() {
    return ensure(
      await this.otherModels.entity.findById(this.entity_id),
      `Couldn’t find entity for user–entity permission ${this.entity_id} (expected entity with ID ${this.entity_id})`,
    );
  }

  /**
   * @returns {Promise<import('./UserAccount').UserAccountRecord>}
   */
  async user() {
    return ensure(
      await this.otherModels.user.findById(this.user_id),
      `Couldn’t find user for user–entity permission ${this.user_id} (expected entity with ID ${this.user_id})`,
    );
  }

  /**
   * @returns {Promise<import('./PermissionGroup').PermissionGroupRecord>}
   */
  async permissionGroup() {
    return ensure(
      await this.otherModels.permissionGroup.findById(this.permission_group_id),
      `Couldn’t find permission group for user–entity permission ${this.permission_group_id} (expected entity with ID ${this.permission_group_id})`,
    );
  }
}

export class UserEntityPermissionModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return UserEntityPermissionRecord;
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
