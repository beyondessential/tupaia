import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class EntityRelationRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ENTITY_RELATION;
}

export class EntityRelationModel extends DatabaseModel {
  syncDirection = SyncDirections.DO_NOT_SYNC; // TODO: in another ticket

  get DatabaseRecordClass() {
    return EntityRelationRecord;
  }
}
