/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';

export type UserRewardsRequest = Request<Record<string, never>, { coconuts: number; pigs: number }>;

export class UserRewardsRoute extends Route<UserRewardsRequest> {
  public async buildResponse() {
    const { user, models } = this.req;

    if (!user) {
      throw new Error('No user attached to request');
    }

    const { id: userId } = user;

    return models.surveyResponse.getRewardsForUser(userId);
  }
}
