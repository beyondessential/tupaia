import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class EntityRelationRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ENTITY_RELATION;
}

export class EntityRelationModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return EntityRelationRecord;
  }
}
