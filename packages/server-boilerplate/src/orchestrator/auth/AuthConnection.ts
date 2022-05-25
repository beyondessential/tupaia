/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { AccessPolicyObject } from '../../types';
import { Credentials } from '../types';
import { ApiConnection } from '../../connections';

const basicAuthHandler = {
  getAuthHeader: async () => {
    const { API_CLIENT_NAME, API_CLIENT_PASSWORD } = process.env;
    const API_CLIENT_CREDENTIALS = `${API_CLIENT_NAME}:${API_CLIENT_PASSWORD}`;
    return `Basic ${Buffer.from(API_CLIENT_CREDENTIALS).toString('base64')}`;
  },
};

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: {
    email: string;
    accessPolicy: AccessPolicyObject;
  };
}

export class AuthConnection extends ApiConnection {
  public baseUrl = process.env.CENTRAL_API_URL || 'http://localhost:8090/v2'; // auth server is actually just central server

  public constructor() {
    super(basicAuthHandler);
  }

  public async login({ emailAddress, password, deviceName }: Credentials) {
    const response = await this.post(
      'auth',
      { grantType: 'password' },
      { emailAddress, password, deviceName: `TUPAIA-SERVER: ${deviceName}` },
    );
    return this.parseAuthResponse(response);
  }

  public async refreshAccessToken(refreshToken: string) {
    const response = await this.post(
      'auth',
      {
        grantType: 'refresh_token',
      },
      {
        refreshToken,
      },
    );
    return this.parseAuthResponse(response);
  }

  private parseAuthResponse(response: AuthResponse) {
    const { accessToken, refreshToken, user } = response;
    if (!accessToken || !refreshToken || !user) {
      throw new Error('Invalid response from auth server');
    }
    const { accessPolicy, email } = user;
    return { accessToken, refreshToken, accessPolicy, email, user };
  }
}
