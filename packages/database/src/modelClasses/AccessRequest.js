/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class AccessRequestType extends DatabaseType {
  static databaseType = TYPES.ACCESS_REQUEST;
}

export class AccessRequestModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return AccessRequestType;
  }
}
