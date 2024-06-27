/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebUserRewardsRequest } from '@tupaia/types';

export type UserRewardsRequest = Request<
  DatatrakWebUserRewardsRequest.Params,
  DatatrakWebUserRewardsRequest.ResBody,
  DatatrakWebUserRewardsRequest.ReqBody,
  DatatrakWebUserRewardsRequest.ReqQuery
>;

export class UserRewardsRoute extends Route<UserRewardsRequest> {
  public async buildResponse() {
    const { query, session, models } = this.req;
    const { projectId } = query;

    const user = await models.user.findOne({ email: session.email });
    if (!user) {
      throw new Error('No user attached to request');
    }

    const { id: userId } = user;

    return models.surveyResponse.getRewardsForUser(userId, projectId);
  }
}
