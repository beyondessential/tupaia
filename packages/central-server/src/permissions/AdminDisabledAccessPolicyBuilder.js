/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicyBuilder } from '@tupaia/auth';
import { BES_ADMIN_PERMISSION_GROUP } from './constants';

// Builds an access policy for the user while stripping out the "BES Admin" permission group
export class AdminDisabledAccessPolicyBuilder extends AccessPolicyBuilder {
  async getPolicyForUser(userId, useLegacyFormat = false) {
    const fullAccessPolicy = await super.getPolicyForUser(userId, useLegacyFormat);
    if (useLegacyFormat) {
      // This should never be able to happen
      // Legacy app versions should never be able to request with disableAdmin set
      return fullAccessPolicy;
    }

    const strippedAccessPolicy = {};
    Object.entries(fullAccessPolicy).forEach(([country, permissionGroups]) => {
      strippedAccessPolicy[country] = permissionGroups.filter(
        permission => permission !== BES_ADMIN_PERMISSION_GROUP,
      );
    });
    return strippedAccessPolicy;
  }
}
