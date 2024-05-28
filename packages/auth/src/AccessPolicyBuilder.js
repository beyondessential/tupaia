/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildAccessPolicy } from './buildAccessPolicy';
import { buildLegacyAccessPolicy } from './buildLegacyAccessPolicy';

export class AccessPolicyBuilder {
  constructor(models) {
    this.models = models;
  }

  async getPolicyForUser(userId, useLegacyFormat = false) {
    if (!userId) {
      throw new Error(`Error building access policy for userId: ${userId}`);
    }

    if (useLegacyFormat) {
      return buildLegacyAccessPolicy(this.models, userId);
    }

    return buildAccessPolicy(this.models, userId);
  }
}
