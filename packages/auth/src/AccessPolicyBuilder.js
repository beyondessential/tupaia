/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildAccessPolicy } from './buildAccessPolicy';
import { buildLegacyAccessPolicy } from './buildLegacyAccessPolicy';

export class AccessPolicyBuilder {
  constructor(models) {
    this.models = models;
    this.cachedPolicyPromises = {};
    this.setupCacheInvalidation();
  }

  setupCacheInvalidation() {
    // if a user entity permission record is changed, make sure we rebuild the associated user's
    // access policy next time it is requested
    this.models.userEntityPermission.addChangeHandler(({ record }) => {
      this.cachedPolicyPromises[record.user_id] = null;
    });
  }

  async getPolicyForUser(userId, useLegacyFormat = false) {
    const cacheKey = `${userId}${useLegacyFormat ? '_legacy' : ''}`;
    if (!this.cachedPolicyPromises[cacheKey]) {
      this.cachedPolicyPromises[cacheKey] = useLegacyFormat
        ? buildLegacyAccessPolicy(this.models, userId)
        : buildAccessPolicy(this.models, userId);
    }
    return this.cachedPolicyPromises[cacheKey];
  }
}
