import { AccessPolicy } from '@tupaia/access-policy';
import { COUNTRY_CODE, ADMIN_PANEL_PERMISSION_GROUP } from '../constants';

export const hasAdminPanelAccess = user => {
  if (!user?.accessPolicy) {
    return false;
  }

  return new AccessPolicy(user.accessPolicy).allows(COUNTRY_CODE, ADMIN_PANEL_PERMISSION_GROUP);
};
