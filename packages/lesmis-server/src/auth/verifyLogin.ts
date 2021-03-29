/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { PermissionsError } from '@tupaia/utils';

import { LESMIS_PERMISSION_GROUP } from '../constants';

export const verifyLogin = (accessPolicy: AccessPolicy) => {
  const authorized = accessPolicy.allowsAnywhere(LESMIS_PERMISSION_GROUP);
  if (!authorized) {
    // throw new PermissionsError('User not authorized for Lesmis');
  }
};
