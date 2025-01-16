import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class CommentRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.COMMENT;
}

export class CommentModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return CommentRecord;
  }
}
