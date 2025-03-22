import { MaterializedViewLogDatabaseModel } from '../analytics';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class AnswerRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ANSWER;
}

export class AnswerModel extends MaterializedViewLogDatabaseModel {
  get DatabaseRecordClass() {
    return AnswerRecord;
  }
}
