/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { PermissionsError } from '@tupaia/utils';

import { VIZ_BUILDER_USER_PERMISSION_GROUP } from '../constants';

export const hasVizBuilderUserAccess = (accessPolicy: AccessPolicy) => {
  const hasAccess = accessPolicy.allowsSome(undefined, VIZ_BUILDER_USER_PERMISSION_GROUP);
  if (!hasAccess) {
    throw new PermissionsError(`Need ${VIZ_BUILDER_USER_PERMISSION_GROUP} access`);
  }

  return hasAccess;
};
