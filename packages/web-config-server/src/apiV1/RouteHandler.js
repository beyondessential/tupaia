import { respond, PermissionsError } from '@tupaia/utils';

import { ValidationError } from '@tupaia/utils/dist/errors';

/**
 * Interface class for handling permission checked endpoints
 * buildResponse must be implemented
 */
export class RouteHandler {
  constructor(req, res) {
    this.req = req;

    this.params = req.params;
    this.query = req.query;
    this.models = req.models;
    this.res = res;
    this.entity = null;
    this.project = null;
  }

  // can be overridden by subclasses with specific permissions checks
  async checkPermissions() {
    const { PermissionsChecker } = this.constructor;
    if (!PermissionsChecker) {
      throw new Error(
        'Each RouteHandler must explicitly specify a permissions checker to ensure permissions have been considered',
      );
    }
    this.permissionsChecker = new PermissionsChecker(
      this.models,
      this.params,
      this.query,
      this.req.userHasAccess,
      this.entity,
      this.project,
    );
    try {
      await this.permissionsChecker.checkPermissions();
    } catch (e) {
      throw new PermissionsError(e.message);
    }
  }

  async handleRequest() {
    // Fetch permissions
    const entityCode = this.query?.entityCode || this.query?.organisationUnitCode;
    this.entity = await this.models.entity.findOne({ code: entityCode });
    if (!this.entity) {
      throw new ValidationError(`Entity ${entityCode} could not be found`);
    }

    this.project = await this.fetchAndCacheProject();

    await this.checkPermissions();
    // if a 'buildResponse' is defined by the subclass, run it and respond, otherwise assume the
    // subclass will override handleRequest directly and respond itself
    if (this.buildResponse) {
      const response = await this.buildResponse();
      respond(this.res, response);
    }
  }

  // arrow functions to avoid binding issues by callers e.g. via this.routeHandler.fetchProject
  fetchAndCacheProject = async () => {
    if (!this.project) {
      this.project = await this.models.project.findOne({
        code: this.query.projectCode || 'explore',
      });
    }

    return this.project;
  };

  fetchHierarchyId = async () => (await this.fetchAndCacheProject()).entity_hierarchy_id;

  fetchTypesExcludedFromWebFrontend = project =>
    project?.config?.frontendExcludedTypes ?? this.models.entity.typesExcludedFromWebFrontend;
}
