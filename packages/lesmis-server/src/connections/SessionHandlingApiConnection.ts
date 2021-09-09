/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ApiConnection, AuthHandler, SessionType } from '@tupaia/server-boilerplate';
import { createBasicHeader } from '@tupaia/utils';

const { MICROSERVICE_CLIENT_USERNAME, MICROSERVICE_CLIENT_SECRET } = process.env;
const DEFAULT_AUTH_HEADER = createBasicHeader(
  MICROSERVICE_CLIENT_USERNAME,
  MICROSERVICE_CLIENT_SECRET,
);

class SessionSwitchingAuthHandler implements AuthHandler {
  session?: SessionType;

  constructor(session?: SessionType) {
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

  constructor(session?: SessionType) {
    const authHandler = new SessionSwitchingAuthHandler(session);
    super(authHandler);
    this.authHandler = authHandler;
  }

  get hasSession() {
    return this.authHandler.hasSession;
  }
}
