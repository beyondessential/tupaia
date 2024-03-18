/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

class EntityRelationRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ENTITY_RELATION;
}

export class EntityRelationModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return EntityRelationRecord;
  }
}
