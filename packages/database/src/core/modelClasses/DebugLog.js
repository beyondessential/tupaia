import { SyncDirections } from '@tupaia/constants';

import { SCHEMA_NAMES } from '../constants';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class DebugLogRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DEBUG_LOG;

  async addInfo(newInfo) {
    await this.database.executeSql('UPDATE logs.debug_log SET info = info || ? WHERE id = ?', [
      JSON.stringify(newInfo),
      this.id,
    ]);
  }
}

export class DebugLogModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get schemaName() {
    return SCHEMA_NAMES.LOG;
  }

  get DatabaseRecordClass() {
    return DebugLogRecord;
  }
}
