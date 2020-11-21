/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Object as RealmObject } from 'realm';
import { AccessPolicy } from '@tupaia/access-policy';

export class User extends RealmObject {
  accessPolicySingleton = null;

  get accessPolicy() {
    if (!this.accessPolicySingleton) {
      this.accessPolicySingleton = new AccessPolicy(this.accessPolicyData);
    }
    return this.accessPolicySingleton;
  }

  hasAccessToSomeEntity(entities) {
    return this.accessPolicy.allowsSome(entities.map(e => e.code));
  }

  /**
   * Whether this survey is available to the given user. Checks whether that user has access to the
   * permission group required by this survey.
   */
  hasAccessToSurveyInEntity(survey, entity) {
    const { permissionGroup } = survey;
    if (!permissionGroup) return false; // this survey is not fully synced yet, don't show it
    return this.hasEntityAccess(entity, permissionGroup.name);
  }

  // User has access if they have access to the entity itself, or some ancestor entity
  hasEntityAccess(entity, permissionGroupName = '') {
    const entities = [];
    let currentEntity = entity;
    while (currentEntity && currentEntity.type !== 'world') {
      entities.push(currentEntity.code);
      currentEntity = currentEntity.parent;
    }

    return this.accessPolicy.allowsSome(entities, permissionGroupName);
  }
}

User.schema = {
  name: 'User',
  primaryKey: 'emailAddress',
  properties: {
    id: { type: 'string', default: 'Failed to store user details' },
    emailAddress: 'string',
    passwordHash: { type: 'string', default: 'Failed to store user details' },
    name: { type: 'string', default: 'Failed to store user details' },
    accessPolicyData: { type: 'string', default: 'Failed to store user details' },
  },
};

User.requiredData = ['emailAddress'];

User.construct = (database, data) => {
  const { accessPolicy, ...userObject } = data;
  userObject.accessPolicyData = JSON.stringify(accessPolicy);
  return database.update('User', userObject);
};
