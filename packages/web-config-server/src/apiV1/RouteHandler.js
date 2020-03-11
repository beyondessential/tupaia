import { respond } from '@tupaia/utils';
import { getDhisApiInstance } from '/dhis';
import { PermissionsChecker } from './utils/PermissionsChecker';
import { Entity } from '/models';

/**
 * Interface class for handling permission checked endpoints
 * buildResponse must be implemented
 */
export class RouteHandler {
  async handleRequest(req, res) {
    // Fetch permissions
    const regionalDhisApi = getDhisApiInstance();
    const { organisationUnitCode } = req.query;
    this.entity = await Entity.findOne({ code: organisationUnitCode });
    const permissionsChecker = new PermissionsChecker(req, regionalDhisApi, this.entity);
    const permissionJson = await permissionsChecker.getPermissionsOrThrowError();
    if (permissionJson) {
      // Join userLevel and overlays to this
      const { userLevel, overlays } = permissionJson;
      this.userLevel = userLevel;
      this.overlays = overlays;
    }
    const response = await this.buildResponse(req);
    respond(res, response);
  }
}
