import { SyncDirections } from '@tupaia/constants';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class UserEntityPermissionRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.USER_ENTITY_PERMISSION;

  static joins = /** @type {const} */ ([
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
  ]);

  /**
   * @returns {Promise<import('./Entity').EntityRecord>}
   */
  async entity() {
    return this.otherModels.entity.findById(this.entity_id);
  }

  /**
   * @returns {Promise<import('./UserAccount').UserAccountRecord>}
   */
  async user() {
    return this.otherModels.user.findById(this.user_id);
  }

  /**
   * @returns {Promise<import('./PermissionGroup').PermissionGroupRecord>}
   */
  async permissionGroup() {
    return this.otherModels.permissionGroup.findById(this.permission_group_id);
  }
}

export class UserEntityPermissionModel extends DatabaseModel {
  static syncDirection = SyncDirections.PULL_FROM_CENTRAL;

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

  async buildSyncLookupQueryDetails() {
    return null;
  }
}
