/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class ApiRequestLogType extends DatabaseType {
  static databaseType = TYPES.API_REQUEST_LOG;
}

export class ApiRequestLogModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return ApiRequestLogType;
  }
}
