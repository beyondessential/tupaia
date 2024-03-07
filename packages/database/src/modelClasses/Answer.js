/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { MaterializedViewLogDatabaseModel } from '../analytics';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

class AnswerRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ANSWER;
}

export class AnswerModel extends MaterializedViewLogDatabaseModel {
  get DatabaseRecordClass() {
    return AnswerRecord;
  }
}
