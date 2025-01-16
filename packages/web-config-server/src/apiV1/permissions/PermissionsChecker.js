import { PermissionsError } from '@tupaia/utils';

export class PermissionsChecker {
  constructor(models, params, query, userHasAccess, entity, project) {
    this.models = models;
    this.params = params;
    this.query = query;
    this.userHasAccess = userHasAccess;
    this.entity = entity;
    this.project = project;
  }

  async checkPermissions() {
    if (!this.entity) {
      throw new PermissionsError('Tried to access an entity that does not exist');
    }

    if (this.entity.isWorld()) {
      return; // Don't restrict access to World
    }

    if (this.entity.isProject()) {
      return; // Don't restrict access to Project entities
    }

    if (!(await this.userHasAccess(this.entity))) {
      throw new PermissionsError(`No access to selected entity ${this.entity.code}`);
    }
  }

  fetchPermissionGroups() {
    throw new Error('This PermissionChecker does not implement "fetchPermissionsGroups"');
  }

  async checkHasEntityAccess(entityCode) {
    if (entityCode === 'World' || entityCode === 'explore') {
      return true; // currently, all users have access to everything in the explore project and at the world level.
    }
    const permissionGroups = await this.fetchPermissionGroups();
    const accessToPermissionGroups = await Promise.all(
      permissionGroups.map(p => this.userHasAccess(entityCode, p)),
    );
    return accessToPermissionGroups.some(a => a);
  }
}
