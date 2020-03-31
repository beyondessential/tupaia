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
    const roleLists = Object.values(this.policy);
    if (roleLists.length === 0) {
      throw new Error('At least one entity should be specified in an access policy');
    }
    if (roleLists.some(roles => !Array.isArray(roles))) {
      throw new Error('Each entity should contain an array of roles for which the user has access');
    }
  }

  /**
   * Check if the user has access to a given role for the given entity
   *
   * @param {string} entity
   * @param {string} [role]
   *
   * @returns boolean Whether or not the user has access to any of the entities, optionally for
   *                  the given role
   */
  allows(entity, role) {
    return this.allowsSome([entity], role);
  }

  /**
   * Check if the user has access to a given role for any of a given set of entities e.g.
   * - accessPolicy.allows(['DL', 'DL_North'], 'Donor');
   * - accessPolicy.allows(['DL']);
   *
   * @param {string[]} entities
   * @param {string} [role]
   *
   * @returns boolean Whether or not the user has access to any of the entities, optionally for
   *                  the given role
   */
  allowsSome(entities = [], role) {
    if (!role) {
      return entities.some(entityCode => !!this.policy[entityCode]);
    }

    const allowedRoles = this.getRoles(entities);
    return allowedRoles.has(role);
  }

  /**
   * Return roles the user has access to for the given entities (or all roles they can access if no
   * entities provided)
   *
   * @param {string[]} [entities]
   *
   * @returns string[] The roles, e.g ['Admin', 'Donor']
   */
  getRoles(entities = Object.keys(this.policy)) {
    const roles = new Set();
    entities.forEach(
      entityCode => this.policy[entityCode] && this.policy[entityCode].forEach(r => roles.add(r)),
    );
    return roles;
  }
}
