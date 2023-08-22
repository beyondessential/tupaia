/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebCountryAccessListRequest } from '@tupaia/types';

export type CountryAccessListRequest = Request<
  TupaiaWebCountryAccessListRequest.Params,
  TupaiaWebCountryAccessListRequest.ResBody,
  TupaiaWebCountryAccessListRequest.ReqBody,
  TupaiaWebCountryAccessListRequest.ReqQuery
>;

export class CountryAccessListRoute extends Route<CountryAccessListRequest> {
  public async buildResponse() {
    const { ctx } = this.req;
    return ctx.services.central.fetchResources('me/countries');
  }
}
