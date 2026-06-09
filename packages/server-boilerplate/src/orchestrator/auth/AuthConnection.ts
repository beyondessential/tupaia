import { createBasicHeader, requireEnv } from '@tupaia/utils';
import { AccessPolicyObject } from '../../types';
import { Credentials, OneTimeCredentials, RequestResetPasswordCredentials } from '../types';
import { ApiConnection } from '../../connections';

const DEFAULT_NAME = 'TUPAIA-SERVER';

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  preferences?: Record<string, unknown>;
  user?: {
    email: string;
    accessPolicy: AccessPolicyObject;
  };
}

const basicAuthHandler = {
  getAuthHeader: async () => {
    const API_CLIENT_NAME = requireEnv('API_CLIENT_NAME');
    const API_CLIENT_PASSWORD = requireEnv('API_CLIENT_PASSWORD');
    return createBasicHeader(API_CLIENT_NAME, API_CLIENT_PASSWORD);
  },
};

export class AuthConnection extends ApiConnection {
  public baseUrl = process.env.CENTRAL_API_URL || 'http://localhost:8090/v2'; // auth server is actually just central server

  public constructor() {
    super(basicAuthHandler);
  }

  public async login(
    { emailAddress, password, deviceName, timezone }: Credentials,
    serverName: string = DEFAULT_NAME,
    ip?: string,
  ) {
    const response = await this.post(
      'auth',
      { grantType: 'password' },
      { emailAddress, password, deviceName: `${serverName}: ${deviceName}`, timezone },
      // forward the client's IP address to the auth server
      { 'x-forwarded-for': ip },

    );
    return this.parseAuthResponse(response);
  }

  public async oneTimeLogin(
    { token, deviceName }: OneTimeCredentials,
    serverName: string = DEFAULT_NAME,
  ) {
    const response = await this.post(
      'auth',
      { grantType: 'one_time_login' },
      { token, deviceName: `${serverName}: ${deviceName}` },
    );
    return this.parseAuthResponse(response);
  }

  public async requestResetPassword({
    emailAddress,
    resetPasswordUrl,
  }: RequestResetPasswordCredentials) {
    return this.post('auth/resetPassword', {}, { emailAddress, resetPasswordUrl });
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
