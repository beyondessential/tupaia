import { respond } from '@tupaia/utils';
import { getDhisApiInstance } from '/dhis';
import { PermissionsChecker } from './utils/PermissionsChecker';
import { Entity } from '/models';

/**
 * Interface class for handling permission checked endpoints
 * buildResponse must be implemented
 */
export class RouteHandler {
  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  async handleRequest() {
    // Fetch permissions
    const regionalDhisApi = getDhisApiInstance();
    const { organisationUnitCode } = this.req.query;
    this.entity = await Entity.findOne({ code: organisationUnitCode });
    const permissionsChecker = new PermissionsChecker(this.req, regionalDhisApi, this.entity);
    const permissionJson = await permissionsChecker.getPermissionsOrThrowError();
    if (permissionJson) {
      // Join userLevel and overlays to this
      const { userLevel, overlays } = permissionJson;
      this.userLevel = userLevel;
      this.overlays = overlays;
    }
    const response = await this.buildResponse(this.req);
    respond(this.res, response);
  }
}
