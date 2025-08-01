import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class EntityParentChildRelationRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ENTITY_PARENT_CHILD_RELATION;
}

export class EntityParentChildRelationModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return EntityParentChildRelationRecord;
  }
}
