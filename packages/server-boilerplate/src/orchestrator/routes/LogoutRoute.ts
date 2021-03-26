/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { Route } from './Route';

export class LogoutRoute extends Route {
  async buildResponse() {
    const { sessionCookie } = this;
    const sessionId = sessionCookie?.id;

    if (sessionId && this.sessionModel) {
      await this.sessionModel.deleteById(sessionId);
    }

    if (sessionCookie !== undefined) {
      sessionCookie.reset?.();
    }

    return { success: true };
  }
}
