/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { createBasicHeader, getEnvVarOrDefault } from '@tupaia/utils';
import { AuthHandler } from '@tupaia/api-client';
import { SessionType } from '../models';

// Handles switching between microservice client and user login sessions
export class SessionSwitchingAuthHandler implements AuthHandler {
  req: Request;
  session?: SessionType;

  // AuthHandlers are run before the session is attached to the request
  // So we unfortunately need to fetch it separately here
  constructor(req: Request) {
    // Save out the request so we can use the attached models later
    this.req = req;
  }

  private async getSession() {
    // We let this resolve undefined if there's no current session
    if (!this.session) {
      const sessionId = this.req.sessionCookie?.id;
      if (sessionId) {
        this.session = await this.req.sessionModel.findById(sessionId);
      }
    }

    return this.session;
  }

  async getAuthHeader() {
    await this.getSession();

    if (this.session) {
      return this.session.getAuthHeader();
    }

    return createBasicHeader(
      getEnvVarOrDefault('API_CLIENT_NAME', ''),
      getEnvVarOrDefault('API_CLIENT_PASSWORD', ''),
    );
  }
}
