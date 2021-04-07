/* eslint-disable max-classes-per-file */
/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ApiConnection, AuthHandler, SessionType } from '@tupaia/server-boilerplate';
import { createBasicHeader } from '@tupaia/utils';

const {
  MICROSERVICE_CLIENT_USERNAME,
  MICROSERVICE_CLIENT_PASSWORD,
} = process.env;
const DEFAULT_AUTH_HEADER = createBasicHeader(
  MICROSERVICE_CLIENT_USERNAME,
  MICROSERVICE_CLIENT_PASSWORD,
);

class SessionSwitchingAuthHandler implements AuthHandler {
  session?: SessionType;

  constructor(session?: SessionType) {
    this.session = session;
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
}
