/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export class AccessPolicy {
  constructor(policy) {
    this.policy = typeof policy === 'string' ? JSON.parse(policy) : policy;
    this.validate();
  }

  validate() {
    if (!this.policy) {
      throw new Error('Cannot instantiate an AccessPolicy without providing the policy details');
    }
    const entityLists = Object.values(this.policy);
    if (entityLists.length === 0) {
      throw new Error('At least one permission group should be specified in an access policy');
    }
    if (entityLists.some(entities => !Array.isArray(entities))) {
      throw new Error(
        'Each permission group should contain an array of entities for which the user has access',
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
      return Object.keys(this.policy).some(permGroup => this.allowsSome(entities, permGroup));
    }
    const allowedEntities = this.policy[permissionGroup];
    return !!allowedEntities && entities.some(entity => allowedEntities.includes(entity));
  }

  /**
   * Return permission groups the user has access to for the given entities (or all permission groups
   * they can access if no entities provided)
   *
   * @param {string[]} [entities]
   *
   * @returns string[] The permission groups, e.g ['Admin', 'Donor']
   */
  getPermissionGroups(entities) {
    const allPermissionGroups = Object.keys(this.policy);
    if (!entities || entities.length === 0) {
      return allPermissionGroups;
    }
    return allPermissionGroups.filter(permissionGroup => {
      const allowedEntities = this.policy[permissionGroup];
      return entities.some(entity => allowedEntities.includes(entity));
    });
  }
}
