/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '../database';
import { sendEmail } from '../utilities';

const NOTIFIERS = [
  {
    recordType: TYPES.USER_COUNTRY_PERMISSION,
    handler: permissionsNotifier,
  },
];

/**
 * Currently this just emails users when they are granted new permissions. Eventually it should
 * handle all notifications, including other changes and delivering push notifications to the app
 * rather than just emailing the user.
 */
export function initialiseNotifiers(models) {
  NOTIFIERS.forEach(notifier => {
    models.addChangeHandlerForCollection(notifier.recordType, (...args) =>
      notifier.handler(...args, models),
    );
  });
}

/**
 * This will send users an email for each new permission they're granted. A smarter system would
 * hold off and pool several changes for the same user (e.g. if they're being granted permission
 * to three countries at once), but this is good enough.
 */
async function permissionsNotifier(change, record, models) {
  if (change.type === 'delete') {
    return; // Don't notify the user of permissions being taken away
  }

  // Get details of permission granted
  const user = await models.user.findById(record.user_id);
  const country = await models.country.findById(record.country_id);
  const permissionGroup = await models.permissionGroup.findById(record.permission_group_id);

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
