/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { createBasicHeader } from '@tupaia/utils';
import { AuthHandler, SessionType } from '../types';

const { API_CLIENT_NAME = '', API_CLIENT_PASSWORD = '' } = process.env;
const DEFAULT_AUTH_HEADER = createBasicHeader(
  API_CLIENT_NAME,
  API_CLIENT_PASSWORD,
);

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

    return DEFAULT_AUTH_HEADER;
  }
}
