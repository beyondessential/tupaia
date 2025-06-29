import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

const DATA_TABLE_TYPES = {
  INTERNAL: 'internal',
};

export class DataTableRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DATA_TABLE;
}

export class DataTableModel extends DatabaseModel {
  syncDirection = SyncDirections.DO_NOT_SYNC;

  static DATA_TABLE_TYPES = DATA_TABLE_TYPES;

  get DatabaseRecordClass() {
    return DataTableRecord;
  }
}
