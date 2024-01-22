/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import { encryptPassword } from '@tupaia/auth';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class UserType extends DatabaseType {
  static databaseType = TYPES.USER_ACCOUNT;

  get fullName() {
    let userFullName = this.first_name;
    if (this.last_name && this.last_name.length > 0) {
      userFullName += ` ${this.last_name}`;
    }
    return userFullName;
  }

  // Checks if the provided non-encrypted password corresponds to this user
  checkPassword(password) {
    return encryptPassword(password, this.password_salt) === this.password_hash;
  }

  checkIsEmailUnverified() {
    return this.verified_email === this.model.emailVerifiedStatuses.NEW_USER;
  }

  checkIsEmailVerified() {
    return this.verified_email === this.model.emailVerifiedStatuses.VERIFIED;
  }
}

const PUBLIC_USER_EMAIL = 'public@tupaia.org';

export class UserModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return UserType;
  }

  /**
   * Returns the user that is used for submitting surveys when not logged in
   * @returns {Promise<null|*>}
   */
  async findPublicUser() {
    const user = await this.findOne({ email: PUBLIC_USER_EMAIL });
    if (!user) {
      throw new Error('Public user not found. There must be a user with email public@tupaia.org');
    }

    return user;
  }

  emailVerifiedStatuses = {
    UNVERIFIED: 'unverified',
    VERIFIED: 'verified',
    NEW_USER: 'new_user',
  };
}
