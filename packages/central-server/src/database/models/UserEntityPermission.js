import { UserEntityPermissionModel as CommonUserEntityPermissionModel } from '@tupaia/database';
import { sendEmail } from '@tupaia/server-utils';

export class UserEntityPermissionModel extends CommonUserEntityPermissionModel {
  meditrakConfig = {
    minAppVersion: '1.14.144',
  };

  notifiers = [onUpsertSendPermissionGrantEmail, expireAccess];
}

const EMAILS = {
  tupaia: {
    subject: 'Tupaia Permission Granted',
    description:
      'This allows you to collect surveys through the Tupaia data collection app, and to see reports and map overlays on <a href="https://tupaia.org">Tupaia.org.</a>',
  },
  lesmis: {
    subject: 'LESMIS Permission Granted',
    description:
      'This allows you to see reports and map overlays on <a href="https://lesmis.la">lesmis.la.</a>',
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
  const user = await models.user.findById(newRecord.user_id, {
    columns: ['email', 'first_name', 'primary_platform'],
  });
  const entity = await models.entity.findById(newRecord.entity_id, { columns: ['name'] });
  const permissionGroup = await models.permissionGroup.findById(newRecord.permission_group_id, {
    columns: ['name'],
  });
  const platform = user.primary_platform ? user.primary_platform : 'tupaia';

  const { subject, description, signOff } = EMAILS[platform];

  sendEmail(user.email, {
    subject,
    signOff,
    templateName: 'permissionGranted',
    templateContext: {
      title: 'Permission Granted',
      description,
      userName: user.first_name,
      entityName: entity.name,
      permissionGroupName: permissionGroup.name,
    },
  });
}

/**
 * This sets the expiry on the users session information to cause a permission refresh. We do this to
 * ensure we don't use a cached version of the accessPolicy after changing a users access
 */
async function expireAccess({ new_record: newRecord, old_record: oldRecord }, models) {
  const userId = newRecord?.user_id || oldRecord.user_id;
  const user = await models.user.findById(userId);
  await user?.expireSessionToken('tupaia_web');
}
