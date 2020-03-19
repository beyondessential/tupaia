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

  // Will check to see if userGroup exists in user permissions, will then see if
  // current organisation unit or ancestors are within user configs for the given
  // user group.
  async matchUserGroupToOrganisationUnit(userGroup) {
    const { code } = this.entity;
    const doesUserHaveAccess = await this.userHasAccess(code, userGroup);

    // All users always have access to 'World' dashboard reports.
    if (code !== 'World' && !doesUserHaveAccess) {
      throw new PermissionsError(
        `User does not have access to ${userGroup} for the entity ${code}`,
      );
    }
  }
}
