/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';
import { sendEmail } from '../../utilities';

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
        code: 'permission_group_name',
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
  notifiers = [onUpsertSendPermissionGrantEmail];

  get DatabaseTypeClass() {
    return UserEntityPermissionType;
  }

  isDeletableViaApi = true;

  async fetchCountryPermissionGroups(userId) {
    const results = await this.database.executeSql(
      `
      SELECT user_entity_permission.*, permission_group.name as permission_group_name, entity.code as entity_code
      FROM user_entity_permission
      JOIN permission_group ON user_entity_permission.permission_group_id = permission_group.id
      JOIN entity ON user_entity_permission.entity_id = entity.id
      WHERE entity.type = 'country'
      AND user_entity_permission.user_id = ?
      `,
      [userId],
    );
    return Promise.all(results.map(this.generateInstance));
  }
}

/**
 * This will send users an email for each new permission they're granted. A smarter system would
 * hold off and pool several changes for the same user (e.g. if they're being granted permission
 * to three countries at once), but this is good enough.
 */
async function onUpsertSendPermissionGrantEmail({ type: changeType, record }, models) {
  if (changeType === 'delete') {
    return; // Don't notify the user of permissions being taken away
  }

  // Get details of permission granted
  const user = await models.user.findById(record.user_id);
  const entity = await models.entity.findById(record.entity_id);
  const permissionGroup = await models.permissionGroup.findById(record.permission_group_id);

  // Compose message to send
  const message = `Hi ${user.first_name},

This is just to let you know that you've been added to the ${permissionGroup.name} access group
for ${entity.name}. This allows you to collect surveys through the Tupaia data collection app,
and to see reports and map overlays on Tupaia.org

Please note that you'll need to log out and then log back in to get access to the new permissions.

Have fun exploring Tupaia, and feel free to get in touch if you have any questions.`;

  // Send the email
  sendEmail(user.email, 'Tupaia Permission Granted', message);
}
