import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { Resolved } from '@tupaia/types';
import { yup } from '@tupaia/utils';
import { TupaiaApiClient } from '@tupaia/api-client';

export type AuthRequest = Request<
  Record<string, never>,
  | Resolved<ReturnType<TupaiaApiClient['auth']['login']>>
  | Resolved<ReturnType<TupaiaApiClient['auth']['refreshAccessToken']>>,
  Record<string, never>,
  {
    grantType?: 'refresh_token';
  }
>;

const reAuthValidator = yup.object().shape({
  refreshToken: yup.string().required(),
});

const loginValidator = yup.object().shape({
  emailAddress: yup.string().required(),
  password: yup.string().required(),
  deviceName: yup.string().required(),
  devicePlatform: yup.string().required(),
  installId: yup.string().required(),
});

export class AuthRoute extends Route<AuthRequest> {
  public async buildResponse() {
    const { query, body } = this.req;
    if (query.grantType === 'refresh_token') {
      const { refreshToken } = reAuthValidator.validateSync(body);
      return this.req.ctx.services.auth.refreshAccessToken(refreshToken);
    }

    const userFields = loginValidator.validateSync(body);
    return this.req.ctx.services.auth.login(userFields);
  }
}
