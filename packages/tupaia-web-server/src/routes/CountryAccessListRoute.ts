/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';

export type CountryAccessListRequest = Request<any, any, any, any>;

export class CountryAccessListRoute extends Route<CountryAccessListRequest> {
  public async buildResponse() {
    const { ctx } = this.req;
    return ctx.services.central.fetchResources('me/countries');
  }
}
