/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { UserEntityPermissionModel as CommonUserEntityPermissionModel } from '@tupaia/database';

import { sendEmail } from '../../utilities';

export class UserEntityPermissionModel extends CommonUserEntityPermissionModel {
  notifiers = [onUpsertSendPermissionGrantEmail];
}

/**
 * This will send users an email for each new permission they're granted. A smarter system would
 * hold off and pool several changes for the same user (e.g. if they're being granted permission
 * to three countries at once), but this is good enough.
 */
// Todo: Update Email For LESMIS
async function onUpsertSendPermissionGrantEmail(
  { type: changeType, new_record: newRecord },
  models,
) {
  if (changeType === 'delete') {
    return; // Don't notify the user of permissions being taken away
  }

  // Get details of permission granted
  const user = await models.user.findById(newRecord.user_id);
  const entity = await models.entity.findById(newRecord.entity_id);
  const permissionGroup = await models.permissionGroup.findById(newRecord.permission_group_id);

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
