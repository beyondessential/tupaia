/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export class RouteHandler {
  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  async handle() {
    await this.assertUserHasAccess(); // run base permissions check for this endpoint
    return this.handleRequest();
  }

  async assertPermissions(assertion) {
    return this.req.assertPermissions(assertion);
  }

  /**
   * All route handlers should provide a concrete "permissions gate" implementation, to check the
   * basic level of access to the resource.
   * There may be additional permissions filtering required in the body of the handler, but this
   * will check whether the user should have any access to the endpoint whatsoever, and throw an
   * error if they shouldn't get any further.
   */
  assertUserHasAccess() {
    throw new Error(`'assertUserHasAccess' must be implemented by every GETHandler`);
  }

  async handleRequest() {
    throw new Error(`'handleRequest' must be implemented by every RouteHandler`);
  }
}
