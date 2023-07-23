/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';

export type RequestCountryAccessRequest = Request<any, any, any, any>;

export class RequestCountryAccessRoute extends Route<RequestCountryAccessRequest> {
  public async buildResponse() {
    const { ctx } = this.req;
    return ctx.services.central.createResource('me/requestCountryAccess', {}, this.req.body);
  }
}
