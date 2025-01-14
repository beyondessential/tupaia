import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class MeditrakSyncQueueRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.MEDITRAK_SYNC_QUEUE;
}

export class MeditrakSyncQueueModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return MeditrakSyncQueueRecord;
  }
}
