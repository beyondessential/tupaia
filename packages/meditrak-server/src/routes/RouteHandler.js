/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export class RouteHandler {
  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  async checkPermissions(permissionsChecker) {
    return this.req.checkPermissions(permissionsChecker);
  }

  async handleRequest() {
    throw new Error(`'handleRequest' must be implemented by every RouteHandler`);
  }
}
