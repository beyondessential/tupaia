/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class Ms1SyncLogType extends DatabaseType {
  static databaseType = TYPES.MS1_SYNC_LOG;
}

export class Ms1SyncLogModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return Ms1SyncLogType;
  }
}
