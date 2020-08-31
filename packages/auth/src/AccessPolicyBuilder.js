/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildAccessPolicy } from './buildAccessPolicy';
import { buildLegacyAccessPolicy } from './buildLegacyAccessPolicy';

const getCacheKey = (userId, useLegacyFormat) => `${userId}${useLegacyFormat ? '_legacy' : ''}`;
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
      const { user_id: userId } = record;
      this.cachedPolicyPromises[getCacheKey(userId, true)] = null; // legacy
      this.cachedPolicyPromises[getCacheKey(userId, false)] = null; // modern
    });
  }

  async getPolicyForUser(userId, useLegacyFormat = false) {
    const cacheKey = getCacheKey(userId, useLegacyFormat);
    if (!this.cachedPolicyPromises[cacheKey]) {
      this.cachedPolicyPromises[cacheKey] = useLegacyFormat
        ? buildLegacyAccessPolicy(this.models, userId)
        : buildAccessPolicy(this.models, userId);
    }
    return this.cachedPolicyPromises[cacheKey];
  }
}
