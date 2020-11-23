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
   * Most route handlers should provide a concrete "permissions gate" implementation, to check the
   * basic level of access to the resource.
   * Others may handle permissions filtering in the body of the handler, in which case the handler
   * does not necessarily need to provide a "gate" (though may still choose to)
   */
  assertUserHasAccess() {}

  async handleRequest() {
    throw new Error(`'handleRequest' must be implemented by every RouteHandler`);
  }
}
