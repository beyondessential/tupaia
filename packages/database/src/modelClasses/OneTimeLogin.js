/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import randomToken from 'rand-token';
import moment from 'moment';
import { DatabaseError, UnauthenticatedError } from '@tupaia/utils';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class OneTimeLoginType extends DatabaseType {
  static databaseType = TYPES.ONE_TIME_LOGIN;

  isExpired() {
    return moment().subtract(1, 'h').isAfter(moment(this.creation_date));
  }

  isUsed() {
    return !!this.use_date;
  }
}

export class OneTimeLoginModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return OneTimeLoginType;
  }

  async create(fields) {
    return super.create({
      ...fields,
      token: randomToken.generate(20),
    });
  }

  async findValidOneTimeLoginOrFail(token, shouldAllowUsed = false, shouldAllowExpired = false) {
    const oneTimeLogin = await this.findOne({ token });
    if (!oneTimeLogin) {
      throw new DatabaseError('No one time login found');
    }

    if (!shouldAllowUsed && oneTimeLogin.isUsed()) {
      throw new DatabaseError('One time login is used');
    }

    if (!shouldAllowExpired && oneTimeLogin.isExpired()) {
      throw new DatabaseError('One time login is expired');
    }

    return oneTimeLogin;
  }

  async isTokenValid(
    token,
    restrictedUserId = null,
    shouldAllowUsed = false,
    shouldAllowExpired = false,
  ) {
    try {
      const oneTimeLogin = await this.findValidOneTimeLoginOrFail(
        token,
        shouldAllowUsed,
        shouldAllowExpired,
      );
      if (restrictedUserId && oneTimeLogin.user_id !== restrictedUserId) {
        throw new UnauthenticatedError('One time login provided is not valid for given user');
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}
