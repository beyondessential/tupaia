/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { format } from 'date-fns';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { JOIN_TYPES } from '../TupaiaDatabase';

const getFriendlyFieldName = field => {
  if (field === 'assignee_id') {
    return 'assignee';
  }
  if (field === 'repeat_schedule') {
    return 'recurring task';
  }

  // Default to replacing underscores with spaces
  return field.replace(/_/g, ' ');
};

const formatValue = async (field, value, models) => {
  switch (field) {
    case 'assignee_id': {
      if (!value) {
        return 'Unassigned';
      }
      const assignee = await models.user.findById(value);
      return assignee.full_name;
    }
    case 'repeat_schedule': {
      if (!value || !value?.frequency) {
        return "Doesn't repeat";
      }

      // TODO: Update this when we add in rrule in RN-1341, to handle date of week/month/year etc
      return `${value.frequency.charAt(0).toUpperCase()}${value.frequency.slice(1)}`;
    }
    case 'due_date': {
      if (!value) {
        return 'No due date';
      }
      return format(new Date(value), 'd MMMM yy');
    }
    default: {
      // Default to capitalizing the value and replacing underscores with spaces
      const words = value.replace(/_/g, ' ');
      return `${words.charAt(0).toUpperCase()}${words.slice(1)}`;
    }
  }
};

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

  async addComment(message, userId, type) {
    const user = await this.otherModels.user.findById(userId);
    return this.otherModels.taskComment.create({
      task_id: this.id,
      message,
      type,
      user_id: userId,
      user_name: user.full_name,
    });
  }

  async addSystemCommentsOnUpdate(updatedFields, userId) {
    const fieldsToCreateCommentsFor = ['due_date', 'repeat_schedule', 'status', 'assignee_id'];
    const comments = [];

    for (const [field, newValue] of Object.entries(updatedFields)) {
      if (!fieldsToCreateCommentsFor.includes(field)) continue;
      const originalValue = this[field];
      if (originalValue === newValue) continue;

      // if the due date is changed and the task is repeating, don't add a comment, because this just means that the repeat schedule is being updated, not that the due date is being changed
      if (field === 'due_date' && updatedFields.repeat_schedule) {
        continue;
      }

      const friendlyFieldName = getFriendlyFieldName(field);
      const formattedOriginalValue = await formatValue(field, originalValue, this.otherModels);
      const formattedNewValue = await formatValue(field, newValue, this.otherModels);

      comments.push(
        `Changed ${friendlyFieldName} from ${formattedOriginalValue} to ${formattedNewValue}`,
      );
    }

    if (!comments.length) return;

    await Promise.all(comments.map(message => this.addComment(message, userId, 'system')));
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
