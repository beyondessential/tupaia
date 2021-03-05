/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { PermissionsError } from '@tupaia/utils';
import { AuthConnection } from '../connections/AuthConnection';
import { Route } from './Route';
import { Credentials, AccessPolicyObject } from '../types';

export class LoginRoute extends Route {
  async buildResponse() {
    const credentials: Credentials = this.req.body;

    const authConnection = new AuthConnection();
    const response = await authConnection.login(credentials);

    const { id, email, accessPolicy } = await this.sessionModel.createSession(response);

    // in the login route the verify auth method is optional and
    // after the build response so that the user is logged in already
    this.verifyAuth(accessPolicy);

    // set sessionId cookie
    this.req.sessionCookie = { id, email };

    return { user: response.user };
  }

  protected verifyAuth(accessPolicy: AccessPolicyObject): void {}
}
