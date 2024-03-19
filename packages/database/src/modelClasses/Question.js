/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { MaterializedViewLogDatabaseModel } from '../analytics';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class QuestionRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.QUESTION;
}

export class QuestionModel extends MaterializedViewLogDatabaseModel {
  get DatabaseRecordClass() {
    return QuestionRecord;
  }
}
