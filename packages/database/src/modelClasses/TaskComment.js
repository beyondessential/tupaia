/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

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
}
