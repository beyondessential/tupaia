/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export class AccessPolicy {
  constructor(policy) {
    this.policy = typeof policy === 'string' ? JSON.parse(policy) : policy;
    this.validate();
    this.cachedPermissionGroupSets = {};
  }

  validate() {
    if (!this.policy) {
      throw new Error('Cannot instantiate an AccessPolicy without providing the policy details');
    }
    const permissionGroupLists = Object.values(this.policy);
    if (permissionGroupLists.length === 0) {
      throw new Error('At least one entity should be specified in an access policy');
    }
    if (permissionGroupLists.some(permissionGroups => !Array.isArray(permissionGroups))) {
      throw new Error(
        'Each entity should contain an array of permissionGroups for which the user has access',
      );
    }
  }

  /**
   * Check if the user has access to a given permission group for the given entity
   *
   * @param {string} entity
   * @param {string} [permissionGroup]
   *
   * @returns boolean Whether or not the user has access to any of the entities, optionally for
   *                  the given permission group
   */
  allows(entity, permissionGroup) {
    return this.allowsSome([entity], permissionGroup);
  }

  /**
   * Check if the user has access to a given permission group for any of a given set of entities e.g.
   * - accessPolicy.allows(['DL', 'DL_North'], 'Donor');
   * - accessPolicy.allows(['DL']);
   *
   * @param {string[]} entities
   * @param {string} [permissionGroup]
   *
   * @returns boolean Whether or not the user has access to any of the entities, optionally for
   *                  the given permission group
   */
  allowsSome(entities = [], permissionGroup) {
    if (!permissionGroup) {
      return entities.some(entityCode => !!this.policy[entityCode]);
    }

    const allowedPermissionGroups = this.getPermissionGroups(entities);
    return allowedPermissionGroups.has(permissionGroup);
  }

  /**
   * Return permission groups the user has access to for the given entities (or all permission
   * groups they can access if no entities provided)
   *
   * @param {string[]} [entities]
   *
   * @returns string[] The permission groups, e.g ['Admin', 'Donor']
   */
  getPermissionGroups(entities = Object.keys(this.policy)) {
    // cache this part, as it is run often and is the most expensive operation
    const cacheKey = entities.join('_');
    if (!this.cachedPermissionGroupSets[cacheKey]) {
      const permissionGroups = new Set();
      entities.forEach(
        entityCode =>
          this.policy[entityCode] && this.policy[entityCode].forEach(r => permissionGroups.add(r)),
      );
      this.cachedPermissionGroupSets[cacheKey] = permissionGroups;
    }
    return this.cachedPermissionGroupSets[cacheKey];
  }

  getRawPolicy() {
    return this.policy;
  }
}
