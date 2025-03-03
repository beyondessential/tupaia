import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';

export type VerifyEmailRequest = Request<{ emailToken: string }, any, any, any>;

export class VerifyEmailRoute extends Route<VerifyEmailRequest> {
  public async buildResponse() {
    const { emailToken } = this.req.params;
    return this.req.ctx.services.central.verifyUserEmail(emailToken);
  }
}
