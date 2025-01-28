import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebRequestCountryAccessRequest } from '@tupaia/types';

export type RequestCountryAccessRequest = Request<
  TupaiaWebRequestCountryAccessRequest.Params,
  TupaiaWebRequestCountryAccessRequest.ResBody,
  TupaiaWebRequestCountryAccessRequest.ReqBody,
  TupaiaWebRequestCountryAccessRequest.ReqQuery
>;

export class RequestCountryAccessRoute extends Route<RequestCountryAccessRequest> {
  public async buildResponse() {
    const { ctx } = this.req;
    return ctx.services.central.createResource('me/requestCountryAccess', {}, this.req.body);
  }
}
