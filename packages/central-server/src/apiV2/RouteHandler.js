import { catchAsyncErrors } from './middleware';

export const useRouteHandler = HandlerClass =>
  catchAsyncErrors(async (res, req) => {
    const handler = new HandlerClass(res, req);
    await handler.handle();
  });

export class RouteHandler {
  constructor(req, res) {
    this.req = req;
    this.res = res;

    const { accessPolicy, database, path, models, params, query } = req;
    this.accessPolicyInstance = accessPolicy; // use a different name so getter can add a side effect
    this.database = database;
    this.path = path;
    this.models = models;
    this.params = params;
    this.query = query;
  }

  // Get the access policy, and also set the permissions checked flag if the route was marked as
  // being filtered internally (it's the best approximation we have to whether the developer has
  // remembered to actually implement permissions filtering)
  get accessPolicy() {
    if (this.permissionsFilteredInternally) {
      this.req.flagPermissionsChecked();
    }
    return this.accessPolicyInstance;
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
   * does not necessarily need to provide a "gate" (though may still choose to). Classes in this
   * category should have this.permissionsFilteredInternally set to true
   */
  assertUserHasAccess() {
    if (!this.permissionsFilteredInternally) {
      throw new Error(
        `The 'assertUserHasAccess' permissions gate must be implemented by every GETHandler that does not filter permissions internally`,
      );
    }
  }

  async handleRequest() {
    throw new Error(`'handleRequest' must be implemented by every RouteHandler`);
  }
}
