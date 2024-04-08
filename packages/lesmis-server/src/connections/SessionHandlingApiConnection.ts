/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ApiConnection, AuthHandler, SessionRecord } from '@tupaia/server-boilerplate';
import { createBasicHeader } from '@tupaia/utils';

const { API_CLIENT_NAME, API_CLIENT_SECRET } = process.env;
const DEFAULT_AUTH_HEADER = createBasicHeader(API_CLIENT_NAME, API_CLIENT_SECRET);

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
