/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class DhisSyncQueueRecord extends DatabaseType {
  static databaseType = TYPES.DHIS_SYNC_QUEUE;
}

export class DhisSyncQueueModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DhisSyncQueueRecord;
  }
}
