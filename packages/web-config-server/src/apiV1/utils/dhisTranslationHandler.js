import { respond } from '@tupaia/utils';
import { getDhisApiInstance } from '@tupaia/data-broker';
import { PermissionsChecker } from './PermissionsChecker';
import { Entity } from '/models';

/**
 * Interface class for handling in-out translations..
 * buildData must be implemented
 */
export class DhisTranslationHandler {
  async execute(req, res) {
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
    const builtData = await this.buildData(req);
    respond(res, builtData);
  }
}
