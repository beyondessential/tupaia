/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { Resolved } from '@tupaia/tsutils';
import { TupaiaApiClient } from '@tupaia/api-client';

type RefreshTokenBody = {
  refreshToken: string;
};

type ReAuthenticateBody = {
  emailAddress: string;
  password: string;
  deviceName: string;
  devicePlatform: string;
  installId: string;
};

export type AuthRequest = Request<
  {
    grantType?: 'refresh_token';
  },
  | Resolved<ReturnType<TupaiaApiClient['auth']['login']>>
  | Resolved<ReturnType<TupaiaApiClient['auth']['refreshAccessToken']>>,
  ReAuthenticateBody | RefreshTokenBody
>;

const hasRefreshToken = (body: ReAuthenticateBody | RefreshTokenBody): body is RefreshTokenBody =>
  'refreshToken' in body;

export class AuthRoute extends Route<AuthRequest> {
  public async buildResponse() {
    const { body } = this.req;
    if (hasRefreshToken(body)) {
      const { refreshToken } = body;
      return this.req.ctx.services.auth.refreshAccessToken(refreshToken);
    }

    return this.req.ctx.services.auth.login(body);
  }
}
