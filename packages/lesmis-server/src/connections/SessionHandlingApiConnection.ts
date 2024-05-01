/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ApiConnection, AuthHandler, SessionRecord } from '@tupaia/server-boilerplate';
import { createBasicHeader, requireEnv } from '@tupaia/utils';

class SessionSwitchingAuthHandler implements AuthHandler {
  session?: SessionRecord;

  constructor(session?: SessionRecord) {
    this.session = session;
  }

  get hasSession() {
    return !!this.session;
  }

  async getAuthHeader() {
    if (this.session) {
      return this.session.getAuthHeader();
    }
    const API_CLIENT_NAME = requireEnv('API_CLIENT_NAME');
    const API_CLIENT_PASSWORD = requireEnv('API_CLIENT_PASSWORD');
    const DEFAULT_AUTH_HEADER = createBasicHeader(API_CLIENT_NAME, API_CLIENT_PASSWORD);
    return DEFAULT_AUTH_HEADER;
  }
}

export abstract class SessionHandlingApiConnection extends ApiConnection {
  authHandler: SessionSwitchingAuthHandler;

  constructor(session?: SessionRecord) {
    const authHandler = new SessionSwitchingAuthHandler(session);
    super(authHandler);
    this.authHandler = authHandler;
  }

  get hasSession() {
    return this.authHandler.hasSession;
  }
}
