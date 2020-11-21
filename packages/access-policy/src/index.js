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
   * @param {string} [entity]
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
   * - has access to some of the given entities with the given permission group
   *   accessPolicy.allowsSome(['DL', 'DL_North'], 'Donor');
   *
   * - has access to the given entities with some permission group
   *   accessPolicy.allowsSome(['DL']);
   *
   * - some entity has access to Donor
   *   accessPolicy.allowsSome([], 'Donor');
   *
   * @param {string[]} [entities]
   * @param {string} [permissionGroup]
   *
   * @returns boolean Whether or not the user has access to any of the entities, optionally for
   *                  the given permission group
   */
  allowsSome(entities, permissionGroup) {
    if (!entities && !permissionGroup) {
      return false;
    }
    if (!permissionGroup) {
      return entities.some(entityCode => !!this.policy[entityCode]);
    }

    const allowedPermissionGroups = this.getPermissionGroupsSet(entities);
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
  getPermissionGroups(entities) {
    return [...this.getPermissionGroupsSet(entities)];
  }

  getPermissionGroupsSet(requestedEntities) {
    // if no specific entities were requested, fetch the permissions for all of them
    const entities = requestedEntities || Object.keys(this.policy);
    // cache this part, as it is run often and is the most expensive operation
    const cacheKey = `permissions-${entities.join('-')}`;
    if (!this.cachedPermissionGroupSets[cacheKey]) {
      const permissionGroups = new Set();
      entities.forEach(entityCode => {
        if (this.policy[entityCode]) {
          this.policy[entityCode].forEach(r => permissionGroups.add(r));
        }
      });
      this.cachedPermissionGroupSets[cacheKey] = permissionGroups;
    }
    return this.cachedPermissionGroupSets[cacheKey];
  }

  /**
   * Return entities the user has access to the given permission group for
   *
   * @param {string} [permissionGroup]
   *
   * @returns entities[] The entity objects
   */
  getEntitiesAllowed(permissionGroup) {
    return Object.keys(this.policy).filter(e => this.allows(e, permissionGroup));
  }
}
