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

  /**
   * All GET handlers should provide a concrete permissions gate implementation.
   * This is the "gate" because there may be additional permissions filtering required in the body
   * of the handler, but the gate will check whether the user should have any access to the endpoint
   * whatsoever, and throw an error if they shouldn't get any further.
   */
  checkPermissionsGate() {
    throw new Error(`'checkPermissionsGate' must be implemented by every GETHandler`);
  }

  async handleRequest() {
    throw new Error(`'handleRequest' must be implemented by every RouteHandler`);
  }
}
