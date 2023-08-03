/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebUserRequest } from '@tupaia/types';
import camelcaseKeys from 'camelcase-keys';

export type UserRequest = Request<
  TupaiaWebUserRequest.Params,
  TupaiaWebUserRequest.ResBody,
  TupaiaWebUserRequest.ReqBody,
  TupaiaWebUserRequest.ReqQuery
>;

export class UserRoute extends Route<UserRequest> {
  public async buildResponse() {
    const { ctx, session } = this.req;

    // Avoid sending a 'me' request as the api user
    if (!session) {
      // Triggers frontend login
      return {};
    }

    return camelcaseKeys(await ctx.services.central.getUser());
  }
}
