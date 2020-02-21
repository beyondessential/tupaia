/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';
import { sendEmail } from '../../utilities';

class UserCountryPermissionType extends DatabaseType {
  static databaseType = TYPES.USER_COUNTRY_PERMISSION;

  static joins = [
    {
      fields: {
        code: 'country_code',
      },
      joinWith: TYPES.COUNTRY,
      joinCondition: [`${TYPES.COUNTRY}.id`, `${TYPES.USER_COUNTRY_PERMISSION}.country_id`],
    },
  ];

  async country() {
    return this.otherModels.country.findById(this.country_id);
  }

  async user() {
    return this.otherModels.user.findById(this.user_id);
  }

  async permissionGroup() {
    return this.otherModels.permissionGroup.findById(this.permission_group_id);
  }
}

export class UserCountryPermissionModel extends DatabaseModel {
  notifiers = [onUpsertSendPermissionGrantEmail];

  get DatabaseTypeClass() {
    return UserCountryPermissionType;
  }

  isDeletableViaApi = true;
}

/**
 * This will send users an email for each new permission they're granted. A smarter system would
 * hold off and pool several changes for the same user (e.g. if they're being granted permission
 * to three countries at once), but this is good enough.
 */
async function onUpsertSendPermissionGrantEmail(change, models) {
  if (change.type === 'delete') {
    return; // Don't notify the user of permissions being taken away
  }

  // Get details of permission granted
  const userCountryPermission = await models.userCountryPermission.findById(change.record_id);
  const user = await models.user.findById(userCountryPermission.user_id);
  const country = await models.country.findById(userCountryPermission.country_id);
  const permissionGroup = await models.permissionGroup.findById(
    userCountryPermission.permission_group_id,
  );

  // Compose message to send
  const message = `Hi ${user.first_name},

This is just to let you know that you've been added to the ${permissionGroup.name} access group
for ${country.name}. This allows you to collect surveys through the Tupaia data collection app,
and to see reports and map overlays on Tupaia.org

Please note that you'll need to log out and then log back in to get access to the new permissions.

Have fun exploring Tupaia, and feel free to get in touch if you have any questions.`;

  // Send the email
  sendEmail(user.email, 'Tupaia Permission Granted', message);
}
