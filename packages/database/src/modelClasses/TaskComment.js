import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class TaskCommentRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.TASK_COMMENT;
}

export class TaskCommentModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return TaskCommentRecord;
  }

  types = {
    System: 'system',
    User: 'user',
  };

  systemCommentTypes = {
    Create: 'create',
    Update: 'update',
    Complete: 'complete',
    Overdue: 'overdue',
  };
}
