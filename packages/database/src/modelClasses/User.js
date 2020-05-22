/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class UserType extends DatabaseType {
  static databaseType = TYPES.USER_ACCOUNT;
}

export class UserModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return UserType;
  }
}
