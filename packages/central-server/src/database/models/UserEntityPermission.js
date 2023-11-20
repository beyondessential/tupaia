/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { UserEntityPermissionModel as CommonUserEntityPermissionModel } from '@tupaia/database';
import { sendEmail } from '@tupaia/server-utils';

export class UserEntityPermissionModel extends CommonUserEntityPermissionModel {
  notifiers = [onUpsertSendPermissionGrantEmail, expireAccess];
}

const EMAILS = {
  tupaia: {
    subject: 'Tupaia Permission Granted',
    body: (userName, permissionGroupName, entityName) =>
      `Hi ${userName},\n\n` +
      `This is just to let you know that you've been added to the ${permissionGroupName} access group for ${entityName}. ` +
      'This allows you to collect surveys through the Tupaia data collection app, and to see reports and map overlays on Tupaia.org.\n\n' +
      "Please note that you'll need to log out and then log back in to get access to the new permissions.\n\n" +
      'Have fun exploring Tupaia, and feel free to get in touch if you have any questions.\n',
  },
  lesmis: {
    subject: 'LESMIS Permission Granted',
    body: (userName, permissionGroupName, entityName) =>
      `Hi ${userName},\n\n` +
      `This is just to let you know that you've been added to the ${permissionGroupName} access group for ${entityName}. ` +
      'This allows you to see reports and map overlays on lesmis.la.\n\n' +
      "Please note that you'll need to log out and then log back in to get access to the new permissions.\n\n" +
      'Feel free to get in touch if you have any questions.\n',
    signOff: 'Best regards,\nThe LESMIS Team',
  },
};

/**
 * This will send users an email for each new permission they're granted. A smarter system would
 * hold off and pool several changes for the same user (e.g. if they're being granted permission
 * to three countries at once), but this is good enough.
 */
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
  const platform = user.primary_platform ? user.primary_platform : 'tupaia';

  const { subject, body, signOff } = EMAILS[platform];

  sendEmail(user.email, {
    subject,
    text: body(user.first_name, permissionGroup.name, entity.name),
    signOff,
  });
}

/**
 * This sets the expiry on the users session information to cause a permission refresh. We do this to
 * ensure we don't use a cached version of the accessPolicy after changing a users access
 */
async function expireAccess({ new_record: newRecord, old_record: oldRecord }, models) {
  const userId = newRecord?.user_id || oldRecord.user_id;
  const user = await models.user.findById(userId);
  await user.expireSessionToken('tupaia_web');
}
