/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { AuthApiInterface } from '../../connections';
import { AccessPolicyObject } from '../../types';

export class MockAuthApi implements AuthApiInterface {
  public login(authDetails: {
    emailAddress: string;
    password: string;
    deviceName: string;
    devicePlatform?: string | undefined;
    installId?: string | undefined;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
    accessPolicy: AccessPolicyObject;
    email: string;
    user: { email: string; accessPolicy: AccessPolicyObject };
  }> {
    throw new Error('Method not implemented.');
  }
  public refreshAccessToken(
    refreshToken: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    accessPolicy: AccessPolicyObject;
    email: string;
    user: { email: string; accessPolicy: AccessPolicyObject };
  }> {
    throw new Error('Method not implemented.');
  }
}
