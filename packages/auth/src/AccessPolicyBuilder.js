import { buildAccessPolicy } from './buildAccessPolicy';
import { buildLegacyAccessPolicy } from './buildLegacyAccessPolicy';

const getCacheKey = (userId, useLegacyFormat) => `${userId}${useLegacyFormat ? '_legacy' : ''}`;
export class AccessPolicyBuilder {
  constructor(models) {
    this.models = models;
    this.cachedPolicyPromises = {};
    this.setupCacheInvalidation();
  }

  resetCaches() {
    this.cachedPolicyPromises = {};
  }

  resetCachesForUser(userId) {
    this.cachedPolicyPromises[getCacheKey(userId, true)] = null; // legacy
    this.cachedPolicyPromises[getCacheKey(userId, false)] = null; // modern
  }

  setupCacheInvalidation() {
    // if a user entity permission record is changed, make sure we rebuild the associated user's
    // access policy next time it is requested
    this.models.userEntityPermission.addChangeHandler(
      ({ old_record: oldRecord, new_record: newRecord }) => {
        // present in update or delete changes
        if (oldRecord) {
          this.resetCachesForUser(oldRecord.user_id);
        }
        // present in create or update changes
        if (newRecord) {
          this.resetCachesForUser(newRecord.user_id);
        }
      },
    );
    this.models.permissionGroup.addChangeHandler(() => this.resetCaches());
  }

  async getPolicyForUser(userId, useLegacyFormat = false) {
    if (!userId) {
      throw new Error(`Error building access policy for userId: ${userId}`);
    }

    const cacheKey = getCacheKey(userId, useLegacyFormat);
    if (this.cachedPolicyPromises[cacheKey]) {
      return this.cachedPolicyPromises[cacheKey];
    }

    const policyPromise = useLegacyFormat
      ? buildLegacyAccessPolicy(this.models, userId)
      : buildAccessPolicy(this.models, userId);
    this.cachedPolicyPromises[cacheKey] = policyPromise;
    policyPromise.catch(() => {
      this.resetCachesForUser(userId); // Remove from cache if the request fails
    });
    return policyPromise;
  }
}
