/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { RouteHandler } from './RouteHandler';

export class UnauthenticatedRouteHandler extends RouteHandler {
  async verifyAuth() {
    return undefined;
  }
}
