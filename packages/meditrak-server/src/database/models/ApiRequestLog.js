/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

export class ApiRequestLogType extends DatabaseType {
  static databaseType = TYPES.API_REQUEST_LOG;
}

export class ApiRequestLogModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return ApiRequestLogType;
  }
}
