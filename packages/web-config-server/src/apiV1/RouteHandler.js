import { respond, PermissionsError } from '@tupaia/utils';
import { Entity } from '/models';

import { ValidationError } from '@tupaia/utils/dist/errors';

/**
 * Interface class for handling permission checked endpoints
 * buildResponse must be implemented
 */
export class RouteHandler {
  constructor(req, res) {
    this.req = req;
    this.query = req.query;
    this.models = req.models;
    this.res = res;
    this.entity = null;
  }

  // can be overridden by subclasses with specific permissions checks
  async checkPermissions() {
    const PermissionsChecker = this.constructor.PermissionsChecker;
    if (!PermissionsChecker) {
      throw new Error(
        'Each RouteHandler must explicitly specify a permissions checker to ensure permissions have been considered',
      );
    }
    this.permissionsChecker = new PermissionsChecker(
      this.models,
      this.query,
      this.req.userHasAccess,
      this.entity,
    );
    try {
      await this.permissionsChecker.checkPermissions();
    } catch (e) {
      throw new PermissionsError(e.message);
    }
  }

  async handleRequest() {
    // Fetch permissions
    const { organisationUnitCode: entityCode } = this.query;
    this.entity = await Entity.findOne({ code: entityCode });
    if (!this.entity) {
      throw new ValidationError(`Entity ${entityCode} could not be found`);
    }
    await this.checkPermissions();
    // if a 'buildResponse' is defined by the subclass, run it and respond, otherwise assume the
    // subclass will override handleRequest directly and respond itself
    if (this.buildResponse) {
      const response = await this.buildResponse();
      respond(this.res, response);
    }
  }

  async fetchProject() {
    return this.models.project.findOne({ code: this.query.projectCode || 'explore' });
  }

  async fetchHierarchyId() {
    return (await this.fetchProject()).entity_hierarchy_id;
  }
}
