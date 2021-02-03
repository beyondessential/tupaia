/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class Ms1SyncQueueType extends DatabaseType {
  static databaseType = TYPES.MS1_SYNC_QUEUE;
}

export class Ms1SyncQueueModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return Ms1SyncQueueType;
  }
}
