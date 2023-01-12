/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { COUNTRY_CODE, LESMIS_ADMIN_PERMISSION_GROUP } from '../constants';

export const isLesmisAdmin = user => {
  return new AccessPolicy(user.accessPolicy).allows(COUNTRY_CODE, LESMIS_ADMIN_PERMISSION_GROUP);
};
