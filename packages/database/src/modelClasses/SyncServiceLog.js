/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class SyncServiceLogType extends DatabaseType {
  static databaseType = TYPES.SYNC_SERVICE_LOG;
}

export class SyncServiceLogModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return SyncServiceLogType;
  }
}
