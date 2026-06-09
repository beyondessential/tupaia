import randomToken from 'rand-token';
import moment from 'moment';

import { UnauthenticatedError } from '@tupaia/utils';
import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class OneTimeLoginRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ONE_TIME_LOGIN;

  get isExpired() {
    return moment().subtract(1, 'h').isAfter(moment(this.creation_date));
  }

  get isUsed() {
    return !!this.use_date;
  }
}

export class OneTimeLoginModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return OneTimeLoginRecord;
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
      throw new UnauthenticatedError('No one time login found');
    }

    if (!shouldAllowUsed && oneTimeLogin.isUsed) {
      throw new UnauthenticatedError('One time login is used');
    }

    if (!shouldAllowExpired && oneTimeLogin.isExpired) {
      throw new UnauthenticatedError('One time login is expired');
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
      if (e.name === 'UnauthenticatedError') return false;
      throw e;
    }
  }
}
