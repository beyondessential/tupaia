/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';
import { AuthConnection, AuthResponse } from '../auth';
import { Route } from './Route';
import { AccessPolicyObject } from '../../types';
import { Credentials } from '../types';

export class LoginRoute extends Route<Request<Record<string, never>, AuthResponse, Credentials>> {
  async buildResponse() {
    const credentials = this.req.body;

    const authConnection = new AuthConnection();
    const response = await authConnection.login(credentials);

    const { id, email, accessPolicy } = await this.sessionModel.createSession(response);

    this.verifyLoginAuth(accessPolicy);

    // set sessionId cookie
    this.req.sessionCookie = { id, email };

    return { user: response.user };
  }

  // optional method to check if user has permission for the app when logging in
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verifyLoginAuth(accessPolicy: AccessPolicyObject): void {}
}
