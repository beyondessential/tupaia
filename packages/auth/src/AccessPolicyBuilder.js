/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildAccessPolicy } from './buildAccessPolicy';

export class AccessPolicyBuilder {
  constructor(models) {
    this.models = models;
    this.cachedPolicyPromises = {};
    this.setupCacheInvalidation();
  }

  resetCaches() {
    this.cachedPolicyPromises = {};
  }

  resetCacheForUser(userId) {
    this.cachedPolicyPromises[userId] = null; // modern
  }

  setupCacheInvalidation() {
    // if a user entity permission record is changed, make sure we rebuild the associated user's
    // access policy next time it is requested
    this.models.userEntityPermission.addChangeHandler(
      ({ old_record: oldRecord, new_record: newRecord }) => {
        // present in update or delete changes
        if (oldRecord) {
          this.resetCacheForUser(oldRecord.user_id);
        }
        // present in create or update changes
        if (newRecord) {
          this.resetCacheForUser(newRecord.user_id);
        }
      },
    );
    this.models.permissionGroup.addChangeHandler(() => this.resetCaches());
  }

  async getPolicyForUser(userId) {
    if (!userId) {
      throw new Error(`Error building access policy for userId: ${userId}`);
    }

    if (this.cachedPolicyPromises[userId]) {
      return this.cachedPolicyPromises[userId];
    }

    const policyPromise = buildAccessPolicy(this.models, userId);
    this.cachedPolicyPromises[userId] = policyPromise;
    policyPromise.catch(() => {
      this.resetCacheForUser(userId); // Remove from cache if the request fails
    });
    return policyPromise;
  }
}
