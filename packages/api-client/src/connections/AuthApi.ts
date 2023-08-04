/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { AccessPolicyObject } from '../types';
import { BaseApi } from './BaseApi';
import { PublicInterface } from './types';

type ServerAuthResponse = {
  accessToken?: string;
  refreshToken?: string;
  user?: {
    email: string;
    accessPolicy: AccessPolicyObject;
  };
};

type AuthDetails = {
  emailAddress: string;
  password: string;
  deviceName: string;
  devicePlatform?: string;
  installId?: string;
};

export class AuthApi extends BaseApi {
  public async login(authDetails: AuthDetails) {
    const response = await this.connection.post('auth', { grantType: 'password' }, authDetails);
    return this.parseServerResponse(response);
  }

  public async refreshAccessToken(refreshToken: string) {
    const response = await this.connection.post(
      'auth',
      {
        grantType: 'refresh_token',
      },
      {
        refreshToken,
      },
    );
    return this.parseServerResponse(response);
  }

  private parseServerResponse(response: ServerAuthResponse) {
    const { accessToken, refreshToken, user } = response;
    if (!accessToken || !refreshToken || !user) {
      throw new Error('Invalid response from auth server');
    }
    const { accessPolicy, email } = user;
    return { accessToken, refreshToken, accessPolicy, email, user };
  }
}

export interface AuthApiInterface extends PublicInterface<AuthApi> {}
