/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildAccessPolicy } from './buildAccessPolicy';

export class AccessPolicyBuilder {
  constructor(models) {
    this.models = models;
  }

  async getPolicyForUser(userId) {
    if (!userId) {
      throw new Error(`Error building access policy for userId: ${userId}`);
    }

    return buildAccessPolicy(this.models, userId);
  }
}
