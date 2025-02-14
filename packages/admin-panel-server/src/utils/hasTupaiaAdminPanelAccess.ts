import { AccessPolicy } from '@tupaia/access-policy';
import { PermissionsError } from '@tupaia/utils';

import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../constants';

export const hasTupaiaAdminPanelAccess = (policy: AccessPolicy) => {
  const hasAccess = policy.allowsSome(undefined, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP);
  if (!hasAccess) {
    throw new PermissionsError('Your permissions for Tupaia do not allow you to use Admin Panel');
  }

  return hasAccess;
};
