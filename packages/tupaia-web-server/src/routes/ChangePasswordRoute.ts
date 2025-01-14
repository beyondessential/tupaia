import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebChangePasswordRequest } from '@tupaia/types';

export type ChangePasswordRequest = Request<
  TupaiaWebChangePasswordRequest.Params,
  TupaiaWebChangePasswordRequest.ResBody,
  TupaiaWebChangePasswordRequest.ReqBody,
  TupaiaWebChangePasswordRequest.ReqQuery
>;

export class ChangePasswordRoute extends Route<ChangePasswordRequest> {
  public async buildResponse() {
    const { ctx, body } = this.req;

    return ctx.services.central.changeUserPassword(body);
  }
}
