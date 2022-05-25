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

export class UserModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return UserType;
  }

  emailVerifiedStatuses = {
    UNVERIFIED: 'unverified',
    VERIFIED: 'verified',
    NEW_USER: 'new_user',
  };
}
