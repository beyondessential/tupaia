/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export class PermissionsChecker {
  constructor(query, userHasAccess, entity) {
    this.query = query;
    this.userHasAccess = userHasAccess;
    this.entity = entity;
  }

  async checkPermissions() {
    if (!this.entity) {
      throw new PermissionsError('Tried to access an entity that does not exist');
    }

    if (this.entity.code !== 'World' && !(await this.userHasAccess(this.entity))) {
      throw new PermissionsError(`No access to selected entity ${this.entity.code}`);
    }
  }

  fetchPermissionGroups() {
    throw new Error('This PermissionChecker does not implement "fetchPermissionsGroups"');
  }

  async checkHasEntityAccess(entityCode) {
    if (entityCode === 'World') {
      return true; // currently, all users have access to everything at world level
    }
    const permissionGroups = await this.fetchPermissionGroups();
    return Promise.all(permissionGroups.map(p => this.userHasAccess(entityCode, p)));
  }
}
