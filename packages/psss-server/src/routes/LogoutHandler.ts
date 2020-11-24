/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { UnauthenticatedRouteHandler } from './UnauthenticatedRouteHandler';

export class LogoutHandler extends UnauthenticatedRouteHandler {
  async buildResponse() {
    this.req.sessionCookie?.reset();
    return { success: true };
  }
}
