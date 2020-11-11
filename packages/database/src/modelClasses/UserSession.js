/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class UserSessionType extends DatabaseType {
  static databaseType = TYPES.USER_SESSION;
}

export class UserSessionModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return UserSessionType;
  }
}
