/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';

export type FetchUserRequest = Request<
  Record<string, never>,
  Record<string, unknown>[],
  Record<string, never>
>;

export class FetchUserRoute extends Route<FetchUserRequest> {
  public async buildResponse() {
    const user = await this.req.ctx.services.central.getUser();
    return user;
  }
}
