import { respond } from '@tupaia/utils';
import { Entity } from '/models';
import { PermissionsError } from '@tupaia/utils';

/**
 * Interface class for handling permission checked endpoints
 * buildResponse must be implemented
 */
export class RouteHandler {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.entity = null;
  }

  // can be overridden by subclasses with specific permissions checks
  async checkPermissions() {
    const PermissionsChecker = this.prototype.PermissionsChecker;
    if (!PermissionsChecker) {
      throw new Error(
        'Each RouteHandler must explicitly specify a permissions checker to ensure permissions have been considered',
      );
    }
    try {
      const { query, userHasAccess } = this.req;
      const checker = new PermissionsChecker(query, userHasAccess, this.entity);
      await checker.checkPermissions();
    } catch (e) {
      throw new PermissionsError(e.message);
    }
  }

  async handleRequest() {
    // Fetch permissions
    const { organisationUnitCode } = this.req.query;
    this.entity = await Entity.findOne({ code: organisationUnitCode });
    await this.checkPermissions();
    // if a 'buildResponse' is defined by the subclass, run it and respond, otherwise assume the
    // subclass will override handleRequest directly and respond itself
    if (this.buildResponse) {
      const response = await this.buildResponse(this.req);
      respond(this.res, response);
    }
  }
}
