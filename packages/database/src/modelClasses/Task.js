/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class TaskRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.TASK;

  async entity() {
    return this.otherModels.entity.findById(this.entity_id);
  }

  async assignee() {
    return this.otherModels.userAccount.findById(this.assignee_id);
  }

  async survey() {
    return this.otherModels.survey.findById(this.survey_id);
  }
}

export class TaskModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return TaskRecord;
  }

  taskStatuses = {
    TO_DO: 'to_do',
    COMPLETED: 'completed',
    OVERDUE: 'overdue',
    CANCELLED: 'cancelled',
  };
}
