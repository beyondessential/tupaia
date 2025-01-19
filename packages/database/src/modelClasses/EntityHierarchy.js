import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class EntityHierarchyRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ENTITY_HIERARCHY;
}

export class EntityHierarchyModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return EntityHierarchyRecord;
  }
}
