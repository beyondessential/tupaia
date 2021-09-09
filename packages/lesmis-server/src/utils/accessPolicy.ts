/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { AccessPolicy } from '@tupaia/access-policy';
import { PermissionsError } from '@tupaia/utils';
import { LESMIS_COUNTRY_CODE, LESMIS_PERMISSION_GROUPS } from '../constants';

export const hasLesmisAccess = (policy: AccessPolicy) => {
  const hasAccess = policy.allows(LESMIS_COUNTRY_CODE, LESMIS_PERMISSION_GROUPS.PUBLIC);
  if (!hasAccess) {
    throw new PermissionsError('Your permissions for Tupaia do not allow you to login to LESMIS');
  }

  return hasAccess;
};

export const isLesmisAdmin = (policy: Record<string, string[]>) => {
  return new AccessPolicy(policy).allows(LESMIS_COUNTRY_CODE, LESMIS_PERMISSION_GROUPS.ADMIN);
};
