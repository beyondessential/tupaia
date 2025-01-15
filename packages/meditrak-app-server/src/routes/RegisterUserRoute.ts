import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { Resolved } from '@tupaia/types';
import { TupaiaApiClient } from '@tupaia/api-client';

export type RegisterUserRequest = Request<
  Record<string, never>,
  Resolved<ReturnType<TupaiaApiClient['central']['registerUserAccount']>>,
  Record<string, unknown>
>;

export class RegisterUserRoute extends Route<RegisterUserRequest> {
  public async buildResponse() {
    const { body } = this.req;

    return this.req.ctx.services.central.registerUserAccount(body);
  }
}
