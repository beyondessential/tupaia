/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { format } from 'date-fns';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { JOIN_TYPES } from '../TupaiaDatabase';

export class TaskRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.TASK;

  static joins = [
    {
      joinWith: RECORDS.ENTITY,
      joinCondition: ['entity_id', `${RECORDS.ENTITY}.id`],
      fields: { code: 'entity_code', name: 'entity_name', country_code: 'entity_country_code' },
    },
    {
      joinWith: RECORDS.USER_ACCOUNT,
      joinAs: 'assignee',
      joinType: JOIN_TYPES.LEFT,
      joinCondition: ['assignee_id', 'assignee.id'],
      fields: { first_name: 'assignee_first_name', last_name: 'assignee_last_name' },
    },
    {
      joinWith: RECORDS.SURVEY,
      joinCondition: ['survey_id', `${RECORDS.SURVEY}.id`],
      fields: { name: 'survey_name', code: 'survey_code' },
    },
  ];

  async entity() {
    return this.otherModels.entity.findById(this.entity_id);
  }

  async assignee() {
    return this.otherModels.userAccount.findById(this.assignee_id);
  }

  async survey() {
    return this.otherModels.survey.findById(this.survey_id);
  }

  async comments() {
    return this.otherModels.taskComment.find({ task_id: this.id });
  }

  async userComments() {
    return this.otherModels.taskComment.find({ task_id: this.id, type: 'user' });
  }

  async systemComments() {
    return this.otherModels.taskComment.find({ task_id: this.id, type: 'system' });
  }
}

export class TaskModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return TaskRecord;
  }

  customColumnSelectors = {
    task_status: () =>
      `CASE  
        WHEN status = 'cancelled' then 'cancelled'
        WHEN status = 'completed' then 'completed'
        WHEN (status = 'to_do' OR status IS NULL) THEN
            CASE 
                WHEN repeat_schedule IS NOT NULL THEN 'repeating'
                WHEN due_date IS NULL THEN 'to_do'
                WHEN due_date < '${format(new Date(), 'yyyy-MM-dd')}' THEN 'overdue'
                ELSE 'to_do'
            END
        ELSE 'to_do' 
    END`,
    assignee_name: () =>
      `CASE 
        WHEN assignee_id IS NULL THEN 'Unassigned' 
        WHEN assignee.last_name IS NULL THEN assignee.first_name 
        ELSE assignee.first_name || ' ' || assignee.last_name 
      END`,
  };
}
