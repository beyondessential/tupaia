import { AccessPolicy } from '@tupaia/access-policy';
import { PermissionsError } from '@tupaia/utils';
import {
  LESMIS_COUNTRY_CODE,
  ADMIN_PANEL_PERMISSION_GROUP,
  LESMIS_PUBLIC_PERMISSION_GROUP,
} from '../constants';

export const hasLesmisAccess = (policy: AccessPolicy) => {
  const hasAccess = policy.allows(LESMIS_COUNTRY_CODE, LESMIS_PUBLIC_PERMISSION_GROUP);
  if (!hasAccess) {
    throw new PermissionsError('Your permissions for Tupaia do not allow you to login to LESMIS');
  }

  return hasAccess;
};

export const hasAdminPanelAccess = (policy: Record<string, string[]>) => {
  return new AccessPolicy(policy).allows(LESMIS_COUNTRY_CODE, ADMIN_PANEL_PERMISSION_GROUP);
};
