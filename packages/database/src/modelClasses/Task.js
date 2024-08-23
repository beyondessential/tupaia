/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { format } from 'date-fns';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { JOIN_TYPES, QUERY_CONJUNCTIONS } from '../TupaiaDatabase';

const BES_ADMIN_PERMISSION_GROUP = 'BES Admin';
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
      fields: { name: 'survey_name', code: 'survey_code', project_id: 'project_id' },
    },
    {
      joinWith: RECORDS.SURVEY_RESPONSE,
      joinType: JOIN_TYPES.LEFT,
      joinCondition: ['survey_response_id', `${RECORDS.SURVEY_RESPONSE}.id`],
      fields: { data_time: 'data_time', timezone: 'timezone' },
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

  hasValidRepeatSchedule() {
    const repeatSchedule = this.repeat_schedule;
    return (
      repeatSchedule !== null &&
      typeof repeatSchedule === 'object' &&
      Object.keys(repeatSchedule).length > 0
    );
  }

  /**
   * @description Handles the completion of a task. If the task is repeating, a new task is created with the same details as the current task and marked as completed
   * If the task is not repeating, the current task is marked as completed.
   *
   * @param {string} surveyResponseId
   * @param {string | null} userId
   */
  async handleCompletion(surveyResponseId, userId) {
    const {
      survey_id: surveyId,
      entity_id: entityId,
      repeat_schedule: repeatSchedule,
      assignee_id: assigneeId,
      id,
    } = this;

    let commentUserId = userId;
    if (!userId) {
      const user = await this.models.user.findPublicUser();
      commentUserId = user.id;
    }

    if (this.hasValidRepeatSchedule()) {
      // Create a new task with the same details as the current task and mark as completed.
      const where = {
        assignee_id: assigneeId,
        survey_id: surveyId,
        entity_id: entityId,
        repeat_schedule: repeatSchedule,
        status: 'completed',
        survey_response_id: surveyResponseId,
        parent_task_id: id,
      };

      // Check for an existing task so that multiple tasks aren't created for the same survey response
      const existingTask = await this.model.findOne(where);
      if (!existingTask) {
        const newTask = await this.model.create(where);
        await newTask.addComment(
          'Completed this task',
          commentUserId,
          this.otherModels.taskComment.types.System,
        );
        await this.addComment(
          `Completed task ${newTask.id}`,
          commentUserId,
          this.otherModels.taskComment.types.System,
        );
      }
    } else {
      await this.model.updateById(id, {
        status: 'completed',
        survey_response_id: surveyResponseId,
      });
      await this.addComment(
        'Completed this task',
        commentUserId,
        this.otherModels.taskComment.types.System,
      );
    }
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
      user_name: user?.full_name ?? null,
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

  async createAccessPolicyQueryClause(accessPolicy) {
    const countryCodesByPermissionGroupId = await this.getCountryCodesByPermissionGroupId(
      accessPolicy,
    );

    const params = Object.entries(countryCodesByPermissionGroupId).flat().flat(); // e.g. ['permissionGroupId', 'id1', 'id2', 'Admin', 'id3']

    return {
      sql: `
        (
          ${Object.entries(countryCodesByPermissionGroupId)
            .map(([_, countryCodes]) => {
              return `
              (
                survey.permission_group_id = ? AND 
                entity.country_code IN (${countryCodes.map(() => '?').join(', ')})
              )
            `;
            })
            .join(' OR ')}
        )
       `,
      parameters: params,
    };
  }

  async getCountryCodesByPermissionGroupId(accessPolicy) {
    const allPermissionGroupsNames = accessPolicy.getPermissionGroups();
    const countryCodesByPermissionGroupId = {};
    const permissionGroupNameToId = await this.otherModels.permissionGroup.findIdByField(
      'name',
      allPermissionGroupsNames,
    );
    for (const [permissionGroupName, permissionGroupId] of Object.entries(
      permissionGroupNameToId,
    )) {
      const countryCodes = accessPolicy.getEntitiesAllowed(permissionGroupName);
      countryCodesByPermissionGroupId[permissionGroupId] = countryCodes;
    }
    return countryCodesByPermissionGroupId;
  }

  /**
   * @description Count tasks that the user has access to
   *
   * @param {AccessPolicy} accessPolicy
   * @param {object} dbConditions
   * @param {object} customQueryOptions
   */
  async countTasksForAccessPolicy(accessPolicy, dbConditions, customQueryOptions) {
    // Check if the user has BES Admin access
    const hasBESAdminAccess = accessPolicy.allowsSome(undefined, BES_ADMIN_PERMISSION_GROUP);
    const queryClause = await this.createAccessPolicyQueryClause(accessPolicy);

    // If the user has BES Admin access, return the count of all tasks that match the conditions, otherwise return the count of tasks that match the conditions and the access policy
    const queryConditions = hasBESAdminAccess
      ? dbConditions
      : {
          [QUERY_CONJUNCTIONS.RAW]: queryClause,
          ...dbConditions,
        };

    return this.count(queryConditions, {
      multiJoin: customQueryOptions.multiJoin,
    });
  }

  customColumnSelectors = {
    task_due_date: () => `to_timestamp(due_date/1000)`,
    task_status: () =>
      `CASE  
        WHEN status = 'cancelled' then 'cancelled'
        WHEN status = 'completed' then 'completed'
        WHEN (status = 'to_do' OR status IS NULL) THEN
            CASE 
                WHEN repeat_schedule IS NOT NULL THEN 'repeating'
                WHEN due_date IS NULL THEN 'to_do'
                WHEN due_date < ${new Date().getTime()} THEN 'overdue'
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
