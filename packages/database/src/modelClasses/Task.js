import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { JOIN_TYPES, QUERY_CONJUNCTIONS } from '../TupaiaDatabase';

const BES_ADMIN_PERMISSION_GROUP = 'BES Admin';

/**
 * @description Format the value of a field for display in a comment. This is used to make the comment more human-readable, and handles special cases like formatting dates and assignee names
 *
 * @param {string} field
 * @param {*} value
 * @param {*} models
 * @returns {Promise<string>}
 */
const formatValue = async (field, value, models) => {
  if (value === null || value === undefined) return null;
  if (field === 'assignee_id') {
    const assignee = await models.user.findById(value);
    return assignee.full_name;
  }

  if (field === 'repeat_schedule') {
    return value?.freq ?? null;
  }
  return value;
};

export class TaskRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.TASK;

  statusTypes = {
    ToDo: 'to_do',
    Completed: 'completed',
    Cancelled: 'cancelled',
  };

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
      due_date: dueDate,
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
        status: this.statusTypes.Completed,
        survey_response_id: surveyResponseId,
        due_date: dueDate,
        parent_task_id: id,
      };

      // Check for an existing task so that multiple tasks aren't created for the same survey response
      const existingTask = await this.model.findOne(where);

      if (existingTask) return;
      const newTask = await this.model.create(where);
      await newTask.addCompletedComment(commentUserId);
      await this.addCompletedComment(commentUserId);
      return;
    }
    await this.model.updateById(id, {
      status: 'completed',
      survey_response_id: surveyResponseId,
    });
    await this.addCompletedComment(commentUserId);
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
   */
  async addComment({ message, userId, type, templateVariables }) {
    const user = await this.otherModels.user.findById(userId);
    return this.otherModels.taskComment.create({
      task_id: this.id,
      type,
      user_id: userId,
      user_name: user?.full_name ?? null,
      message,
      template_variables: templateVariables,
    });
  }

  /**
   *
   * @param {string} message
   * @param {string} userId
   *
   * @description Add a user comment to the task
   */
  async addUserComment(message, userId) {
    return this.addComment({
      message,
      userId,
      type: this.otherModels.taskComment.types.User,
    });
  }

  /**
   *
   * @param {object} templateVariables
   * @param {string} userId
   *
   * @description Add a system comment to the task
   */
  async addSystemComment(templateVariables, userId) {
    return this.addComment({
      userId,
      type: this.otherModels.taskComment.types.System,
      templateVariables,
    });
  }

  /**
   *
   * @param {string} userId
   * @param {object} templateVariables
   *
   * @description Add a comment when a task is updated
   */
  async addUpdatedComment(userId, templateVariables) {
    return this.addSystemComment(
      {
        type: this.otherModels.taskComment.systemCommentTypes.Update,
        ...templateVariables,
      },
      userId,
    );
  }

  /**
   *
   * @param {string} userId
   *
   * @description Add a comment when a task is created
   */
  async addCreatedComment(userId) {
    return this.addSystemComment(
      {
        type: this.otherModels.taskComment.systemCommentTypes.Create,
      },
      userId,
    );
  }

  /**
   *
   * @param {string} userId
   *
   * @description Add a comment when a task is completed
   */
  async addCompletedComment(userId) {
    return this.addSystemComment(
      {
        type: this.otherModels.taskComment.systemCommentTypes.Complete,
      },
      userId,
    );
  }

  /**
   *
   * @param {string} userId
   *
   * @description Add a comment when a task overdue email is sent
   */
  async addOverdueComment(userId) {
    return this.addSystemComment(
      {
        type: this.otherModels.taskComment.systemCommentTypes.Overdue,
      },
      userId,
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

  /**
   *
   * @param {object} fields
   * @param {string} [createdBy]
   * @returns Task
   */
  async create(fields, createdBy) {
    const task = await super.create(fields);
    if (createdBy) {
      await task.addCreatedComment(createdBy);
    }
    return task;
  }

  /**
   * @description Add system comments for task updates. This is used to automatically add comments when certain fields are updated, e.g. due date, assignee, etc.
   *
   * @param {object} originalTask
   * @param {object} updatedFields
   * @param {string} userId
   */
  async addSystemCommentsOnUpdate(originalTask, updatedFields, userId) {
    const fieldsToCreateCommentsFor = ['due_date', 'repeat_schedule', 'status', 'assignee_id'];
    const comments = [];

    // Loop through the updated fields and add a comment for each one that has changed
    for (const [field, newValue] of Object.entries(updatedFields)) {
      // Only create comments for certain fields
      if (!fieldsToCreateCommentsFor.includes(field)) continue;
      const originalValue = originalTask[field];
      // If the field hasn't actually changed, don't add a comment
      if (originalValue === newValue) continue;
      // Don't add a comment when repeat schedule is updated and the frequency is the same
      if (field === 'repeat_schedule' && originalValue?.freq === newValue?.freq) continue;
      // Don't add a comment when due date is updated for repeat schedule
      if (field === 'due_date' && updatedFields.repeat_schedule) continue;

      const [formattedOriginalValue, formattedNewValue] = await Promise.all([
        formatValue(field, originalValue, this.otherModels),
        formatValue(field, newValue, this.otherModels),
      ]);

      comments.push({
        field,
        originalValue: formattedOriginalValue,
        newValue: formattedNewValue,
      });
    }

    if (!comments.length) return;

    await Promise.all(
      comments.map(templateVariables => originalTask.addUpdatedComment(userId, templateVariables)),
    );
  }

  /**
   *
   * @param {string} id
   * @param {object} updatedFields
   * @param {string} [updatedBy]
   * @returns Task
   */
  async updateById(id, updatedFields, updatedBy) {
    const originalTask = await this.findById(id);
    const updatedTaskResult = await super.updateById(id, updatedFields);
    if (updatedBy) {
      await this.addSystemCommentsOnUpdate(originalTask, updatedFields, updatedBy);
    }
    return updatedTaskResult;
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
