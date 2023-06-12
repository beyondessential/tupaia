/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { createBasicHeader, getEnvVarOrDefault } from '@tupaia/utils';
import { AuthHandler, SessionType } from '../types';

// Handles switching between microservice client and user login sessions
export class SessionSwitchingAuthHandler implements AuthHandler {
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

    return createBasicHeader(
      getEnvVarOrDefault('API_CLIENT_NAME', ''),
      getEnvVarOrDefault('API_CLIENT_PASSWORD', ''),
    );
  }
}
