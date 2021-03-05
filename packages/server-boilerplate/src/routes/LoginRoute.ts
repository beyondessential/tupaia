/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { AuthConnection } from '../connections/AuthConnection';
import { UnauthenticatedRoute } from './UnauthenticatedRoute';
import { Credentials, AccessPolicyObject } from '../types';

export class LoginRoute extends UnauthenticatedRoute {
  async buildResponse() {
    const credentials: Credentials = this.req.body;

    const authConnection = new AuthConnection();
    const response = await authConnection.login(credentials);

    const { id, email, accessPolicy } = await this.sessionModel.createSession(response);

    this.verifyLoginAuth(accessPolicy);

    // set sessionId cookie
    this.req.sessionCookie = { id, email };

    return { user: response.user };
  }

  // optional method to check if user has permission for the app when logging in
  verifyLoginAuth(accessPolicy: AccessPolicyObject): void {}
}
