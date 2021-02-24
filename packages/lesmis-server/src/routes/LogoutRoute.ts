/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { UnauthenticatedRoute } from './UnauthenticatedRoute';

export class LogoutRoute extends UnauthenticatedRoute {
  async buildResponse() {
    const sessionId = this.sessionCookie?.id;

    if (sessionId && this.sessionModel) {
      await this.sessionModel.deleteById(sessionId);
    }

    if (this.sessionCookie) {
      this.sessionCookie.reset();
    }

    return { success: true };
  }
}
