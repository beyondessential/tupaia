import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { TupaiaApiClient } from '@tupaia/api-client';
import { Resolved } from '@tupaia/types';

export type ChangePasswordRequest = Request<
  Record<string, never>,
  Resolved<ReturnType<TupaiaApiClient['central']['changeUserPassword']>>
>;

export class ChangePasswordRoute extends Route<ChangePasswordRequest> {
  public async buildResponse() {
    const { body } = this.req;

    const { oldPassword, password, newPassword, passwordConfirm, newPasswordConfirm } = body;

    // Support both alternatives so that users using versions
    // of meditrak-app prior to 1.9.109 can still change their passwords
    const passwordParam = password || newPassword;
    const passwordConfirmParam = passwordConfirm || newPasswordConfirm;

    return this.req.ctx.services.central.changeUserPassword({
      oldPassword,
      password: passwordParam,
      passwordConfirm: passwordConfirmParam,
    });
  }
}
