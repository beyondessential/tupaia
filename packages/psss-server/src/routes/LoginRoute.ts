/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AuthConnection } from '../connections/AuthConnection';
import { Credentials } from '../types';
import { UnauthenticatedRoute } from './UnauthenticatedRoute';

export class LoginRoute extends UnauthenticatedRoute {
  async buildResponse() {
    const credentials: Credentials = this.req.body;

    const authConnection = new AuthConnection();
    const response = await authConnection.login(credentials);

    const { id, email, accessPolicy } = await this.sessionModel.createSession(response);

    // set sessionId cookie
    this.req.sessionCookie = { id, email };

    return { accessPolicy };
  }
}
