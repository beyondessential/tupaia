/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { format } from 'date-fns';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { JOIN_TYPES } from '../TupaiaDatabase';

/**
 *
 * @description Get a human-friendly name for a field. In most cases, this just replaces underscores with spaces, but there are some special cases like 'assignee_id' and 'repeat_schedule' that need to be handled differently
 *
 * @param {string} field
 * @returns {string}
 */
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

/**
 * @description Format the value of a field for display in a comment. This is used to make the comment more human-readable, and handles special cases like formatting dates and assignee names
 *
 * @param {string} field
 * @param {*} value
 * @param {*} models
 * @returns {Promise<string>}
 */
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

      return `${value.frequency.charAt(0).toUpperCase()}${value.frequency.slice(1)}`;
    }
    case 'due_date': {
      // TODO: Currently repeating tasks don't have a due date, so we need to handle null values. In RN-1341 we will add a due date to repeating tasks overnight, so this will need to be updated then
      if (!value) {
        return 'No due date';
      }
      // Format the date as 'd MMMM yy' (e.g. 1 January 21). This is so that there is no ambiguity between US and other date formats
      return format(new Date(value), 'd MMMM yy');
    }
    default: {
      // Default to capitalizing the value's first character, and replacing underscores with spaces
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

  /**
   * @description Get all comments for the task
   * @returns {Promise<TaskCommentRecord[]>}
   */

  async comments() {
    return this.otherModels.taskComment.find({ task_id: this.id });
  }

  /**
   * @description Get all user comments for the task
   * @returns {Promise<TaskCommentRecord[]>}
   */
  async userComments() {
    return this.otherModels.taskComment.find({
      task_id: this.id,
      type: this.otherModels.taskComment.types.User,
    });
  }

  /**
   * @description Get all system comments for the task
   * @returns {Promise<TaskCommentRecord[]>}
   */

  async systemComments() {
    return this.otherModels.taskComment.find({
      task_id: this.id,
      type: this.otherModels.taskComment.types.System,
    });
  }
  /**
   * @description Add a comment to the task. Handles linking the comment to the task and user, and setting the comment type
   *
   * @param {string} message
   * @param {string} userId
   * @param {string} type
   *
   */

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

  /**
   * @description Add system comments when a task is updated. This is used to automatically add comments when certain fields are updated, e.g. due date, assignee, etc.
   *
   * @param {object} updatedFields
   * @param {string} userId
   */

  async addSystemCommentsOnUpdate(updatedFields, userId) {
    const fieldsToCreateCommentsFor = ['due_date', 'repeat_schedule', 'status', 'assignee_id'];
    const comments = [];

    // Loop through the updated fields and add a comment for each one that has changed
    for (const [field, newValue] of Object.entries(updatedFields)) {
      // Only create comments for certain fields
      if (!fieldsToCreateCommentsFor.includes(field)) continue;
      const originalValue = this[field];
      // If the field hasn't actually changed, don't add a comment
      if (originalValue === newValue) continue;

      // If the due date is changed and the task is repeating, don't add a comment, because this just means that the repeat schedule is being updated, not that the due date is being changed. This will likely change as part of RN-1341
      // TODO: re-evaulate this when RN-1341 is implemented
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

    await Promise.all(
      comments.map(message =>
        this.addComment(message, userId, this.otherModels.taskComment.types.System),
      ),
    );
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
