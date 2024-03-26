/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel, DatabaseRecord, RECORDS } from '@tupaia/database';

class DhisSyncQueueRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DHIS_SYNC_QUEUE;
}

export class DhisSyncQueueModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return DhisSyncQueueRecord;
  }
}
