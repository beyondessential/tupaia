import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class EntityHierarchyRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ENTITY_HIERARCHY;
}

export class EntityHierarchyModel extends DatabaseModel {
  syncDirection = SyncDirections.DO_NOT_SYNC; // TODO: in another ticket

  get DatabaseRecordClass() {
    return EntityHierarchyRecord;
  }
}
