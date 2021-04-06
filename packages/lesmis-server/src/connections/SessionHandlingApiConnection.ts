/* eslint-disable max-classes-per-file */
/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ApiConnection, AuthHandler, SessionType } from '@tupaia/server-boilerplate';
import { createBasicHeader } from '@tupaia/utils';

class SessionSwitchingAuthHandler implements AuthHandler {
  defaultAuthHeader = '';

  session?: SessionType;

  constructor(session?: SessionType) {
    this.session = session;
  }

  setDefaultAuthHeader(header: string) {
    this.defaultAuthHeader = header;
  }

  async getAuthHeader() {
    if (this.session) {
      return this.session.getAuthHeader();
    }

    return this.defaultAuthHeader;
  }
}

type Credentials = {
  username: string;
  password: string;
};

export abstract class SessionHandlingApiConnection extends ApiConnection {
  authHandler: SessionSwitchingAuthHandler;

  constructor(session?: SessionType) {
    const authHandler = new SessionSwitchingAuthHandler(session);
    super(authHandler);
    authHandler.setDefaultAuthHeader(this.getDefaultAuthHeader());
    this.authHandler = authHandler;
  }

  abstract getDefaultCredentials(): Credentials;

  getDefaultAuthHeader(): string {
    const { username, password } = this.getDefaultCredentials();
    return createBasicHeader(username, password);
  }
}
