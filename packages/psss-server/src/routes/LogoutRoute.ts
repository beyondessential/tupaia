/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Route } from './Route';

export class LogoutRoute extends Route {
  async buildResponse() {
    await this.sessionModel.deleteById(this.sessionCookie.id);
    this.sessionCookie?.reset();
    return { success: true };
  }
}
