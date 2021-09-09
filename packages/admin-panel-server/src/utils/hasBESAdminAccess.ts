/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { PermissionsError } from '@tupaia/utils';

import { BES_ADMIN_PERMISSION_GROUP } from '../constants';

export const hasBESAdminAccess = (accessPolicy: AccessPolicy) => {
  const hasAccess = accessPolicy.allowsSome(undefined, BES_ADMIN_PERMISSION_GROUP);
  if (!hasAccess) {
    throw new PermissionsError(`Need ${BES_ADMIN_PERMISSION_GROUP} access`);
  }

  return hasAccess;
};
