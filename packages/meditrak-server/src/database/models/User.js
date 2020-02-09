/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/
import winston from 'winston';

import { hasAccess } from '@beyondessential/tupaia-access-policy';
import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';
import { getUserPermissionGroups } from '../../dataAccessors';
import { buildAccessPolicy, cache, CACHE_KEY_GENERATORS, encryptPassword } from '../../utilities';

class UserType extends DatabaseType {
  static databaseType = TYPES.USER_ACCOUNT;

  get fullName() {
    let userFullName = this.first_name;
    if (this.last_name && this.last_name.length > 0) {
      userFullName += ` ${this.last_name}`;
    }
    return userFullName;
  }

  /**
   * Check if the user has access to an item. eg
   * user.hasAccess('surveys', ['DL', 'DL_North'], 'Donor'); or user.hasAccess('reports', [DL']);
   *
   * @param {string} accessObjectType
   * @param {array} accessTreePath
   * @param {string} accessLevel
   *
   * @returns {boolean} Whether or not the user has permission to the resource.
   */
  async hasAccess(accessObjectType, accessTreePath = [], accessLevel = '') {
    const accessPolicy = await this.getAccessPolicy();

    return hasAccess(accessPolicy, accessObjectType, accessTreePath, accessLevel);
  }

  async getAccessPolicy() {
    if (!this.accessPolicy) {
      try {
        this.accessPolicy = await cache.getOrElse(CACHE_KEY_GENERATORS.accessPolicy(this.id), () =>
          buildAccessPolicy(this.otherModels, this.id),
        );
      } catch (e) {
        winston.error(e);
      }
    }

    return this.accessPolicy;
  }

  async getPermissionGroups(countryIdentifier) {
    if (!this.permissionGroups) {
      this.permissionGroups = {};
    }

    if (!this.permissionGroups[countryIdentifier]) {
      this.permissionGroups[
        countryIdentifier
      ] = await cache.getOrElse(
        CACHE_KEY_GENERATORS.userPermissionGroups(this.id, countryIdentifier),
        () => getUserPermissionGroups(this.otherModels, this.id, countryIdentifier),
      );
    }

    return this.permissionGroups[countryIdentifier];
  }

  // Checks if the provided non-encrypted password corresponds to this user
  checkPassword(password) {
    return encryptPassword(password, this.password_salt) === this.password_hash;
  }
}

export class UserModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return UserType;
  }
}
