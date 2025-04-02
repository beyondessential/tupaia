import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class DebugLogRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DEBUG_LOG;

  async addInfo(info) {
    this.info = { ...this.info, ...info };
    await this.save();
  }
}

export class DebugLogModel extends DatabaseModel {
  syncDirection = SYNC_DIRECTIONS.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return DebugLogRecord;
  }
}
