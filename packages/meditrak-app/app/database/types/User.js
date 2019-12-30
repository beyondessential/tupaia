/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { Object as RealmObject } from 'realm';
import {
  hasAccess,
  hasNestedPermissions,
  someChildHasAccess,
} from '@beyondessential/tupaia-access-policy';

const ACCESS_OBJECT_TYPE = 'surveys';

export class User extends RealmObject {
  get accessPolicy() {
    if (!this.parsedAccessPolicy) {
      this.parsedAccessPolicy = JSON.parse(this.accessPolicyData);
    }

    return this.parsedAccessPolicy;
  }

  // eslint-disable-next-line class-methods-use-this
  set accessPolicy(data) {
    throw new Error('Cannot change user access policy');
  }

  hasCountryAccess(country, permissionGroupName = '') {
    return hasAccess(this.accessPolicy, ACCESS_OBJECT_TYPE, [country.code], permissionGroupName);
  }

  hasAccessToSurveyInCountry(survey, country) {
    return someChildHasAccess(
      this.accessPolicy,
      ACCESS_OBJECT_TYPE,
      [country.code],
      survey.permissionGroup.name,
    );
  }

  hasPermissionsForItemsWithinCountry(country) {
    return hasNestedPermissions(this.accessPolicy, ACCESS_OBJECT_TYPE, [country.code]);
  }

  /**
   * Whether this survey is available to the given user. Checks whether that user has access to the
   * permission group required by this survey.
   **/
  hasAccessToSurveyInEntity(survey, entity) {
    const { permissionGroup } = survey;
    return this.hasEntityAccess(entity, permissionGroup.name);
  }

  // User has access if they have access to the entity itself, or some parent geographical
  // area/country and aren't denied access further down the geographical hierarchy.
  //
  // @see https://github.com/beyondessential/tupaia-access-policy
  hasEntityAccess(entity, permissionGroupName = '') {
    const entityPath = [];
    let currentEntity = entity;
    while (currentEntity && currentEntity.type !== 'world') {
      entityPath.unshift(currentEntity.code);
      currentEntity = currentEntity.parent;
    }

    return hasAccess(this.accessPolicy, ACCESS_OBJECT_TYPE, entityPath, permissionGroupName);
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
