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

export abstract class SessionHandlingApiConnection extends ApiConnection {
  authHandler: SessionSwitchingAuthHandler;

  constructor(session?: SessionType) {
    const authHandler = new SessionSwitchingAuthHandler(session);
    super(authHandler);
    authHandler.setDefaultAuthHeader(this.getDefaultAuthHeader());
    this.authHandler = authHandler;
  }

  getDefaultAuthHeader(): string {
    const {
      MICROSERVICE_CLIENT_USERNAME: username,
      MICROSERVICE_CLIENT_PASSWORD: password,
    } = process.env;
    if (!username || !password) {
      throw new Error(
        'Default credentials for LESMIS Server must be defined as environment variables',
      );
    }
    return createBasicHeader(username, password);
  }
}
