import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';

export type RegisterRequest = Request;

export class RegisterRoute extends Route<RegisterRequest> {
  public buildResponse() {
    return this.req.ctx.services.central.registerUserAccount(this.req.body);
  }
}
