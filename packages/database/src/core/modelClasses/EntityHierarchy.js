import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class EntityHierarchyRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ENTITY_HIERARCHY;
}

export class EntityHierarchyModel extends DatabaseModel {
  static syncDirection = SyncDirections.PULL_FROM_CENTRAL;

  get DatabaseRecordClass() {
    return EntityHierarchyRecord;
  }

  async buildSyncLookupQueryDetails() {
    return null;
  }
}
