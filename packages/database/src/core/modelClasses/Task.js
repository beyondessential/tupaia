/**
 * @typedef {import('@tupaia/access-policy').AccessPolicy} AccessPolicy
 * @typedef {import('@tupaia/types').Country} Country
 * @typedef {import('@tupaia/types').PermissionGroup} PermissionGroup
 */

import { SyncDirections } from '@tupaia/constants';
import { ensure, camelcaseKeys, isNotNullish, isNullish } from '@tupaia/tsutils';
import { generateRRule } from '@tupaia/utils';
import { TaskCommentType, TaskStatus } from '@tupaia/types';
import { hasBESAdminAccess } from '@tupaia/access-policy';
import { getOffsetForTimezone } from '@tupaia/utils';
import { JOIN_TYPES, QUERY_CONJUNCTIONS } from '../BaseDatabase';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { SqlQuery } from '../SqlQuery';
import { buildSyncLookupSelect } from '../sync';
import { mergeMultiJoin } from '../utilities';

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
  if (isNullish(value)) return null;
  if (field === 'assignee_id') {
    const assignee = await models.user.findById(value);
    return assignee.full_name;
  }

  if (field === 'repeat_schedule') {
    return value?.freq ?? null;
  }
  return value;
};

const getTaskMetricsBaseQuery = projectId => ({ 'survey.project_id': projectId });
const getTaskMetricsBaseJoin = () => ({
  joinWith: RECORDS.SURVEY,
  joinCondition: ['survey.id', 'task.survey_id'],
});

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

  /**
   * @returns {Promise<import('./Entity').EntityRecord>}
   */
  async entity() {
    return ensure(
      await this.otherModels.entity.findById(this.entity_id),
      `Couldn’t find entity for task ${this.id} (expected entity with ID ${this.entity_id})`,
    );
  }

  /**
   * @returns {Promise<import('./UserAccount').UserAccountRecord | null>}
   */
  async assignee() {
    if (!this.assignee_id) return null;
    return ensure(
      await this.otherModels.userAccount.findById(this.assignee_id),
      `Couldn’t find assignee for task ${this.id} (expected user account with ID ${this.assignee_id})`,
    );
  }

  /**
   * @returns {Promise<import('./Survey').SurveyRecord>}
   */
  async survey() {
    return ensure(
      await this.otherModels.survey.findById(this.survey_id),
      `Couldn’t find survey for task ${this.id} (expected survey with ID ${this.survey_id})`,
    );
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

  async comments(customQueryOptions) {
    return await this.otherModels.taskComment.find({ task_id: this.id }, customQueryOptions);
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
  static syncDirection = SyncDirections.BIDIRECTIONAL;

  async buildSyncLookupQueryDetails() {
    return {
      select: await buildSyncLookupSelect(this, {
        projectIds: 'array_remove(ARRAY[survey.project_id], NULL)',
      }),
      joins: `LEFT JOIN survey ON survey.id = task.survey_id`,
    };
  }

  get DatabaseRecordClass() {
    return TaskRecord;
  }

  async createAccessPolicyQueryClause(accessPolicy) {
    const countryCodesByPermissionGroupId =
      await this.getCountryCodesByPermissionGroupId(accessPolicy);

    const params = Object.entries(countryCodesByPermissionGroupId).flat(2); // e.g. ['permissionGroupId', 'id1', 'id2', 'Admin', 'id3']

    if (Object.keys(countryCodesByPermissionGroupId).length === 0) {
      return null;
    }

    return {
      sql: `
        (
          ${Object.values(countryCodesByPermissionGroupId)
            .map(
              countryCodes => `(
                survey.permission_group_id = ? AND
                entity.country_code IN ${SqlQuery.record(countryCodes)}
              )`,
            )
            .join(' OR ')}
        )
       `,
      parameters: params,
    };
  }

  /**
   * @param {AccessPolicy} accessPolicy
   * @returns {Promise<Record<PermissionGroup['id'], Country['code'][]>>}
   */
  async getCountryCodesByPermissionGroupId(accessPolicy) {
    const allPermissionGroupsNames = accessPolicy.getPermissionGroups();
    /** @type {Record<PermissionGroup['id'], Country['code'][]>} */
    const countryCodesByPermissionGroupId = {};
    /** @type {Record<PermissionGroup['name'], PermissionGroup['id']>} */
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
    const filtersWithColumnSelectors = { ...dbConditions };

    // use column selectors for custom columns being used in filters
    for (const [key, value] of Object.entries(dbConditions)) {
      if (key in this.customColumnSelectors) {
        const colKey = this.customColumnSelectors[key]();
        filtersWithColumnSelectors[colKey] = value;
        delete filtersWithColumnSelectors[key];
      }
    }

    // Check if the user has BES Admin access
    const hasBESAdminAccess = accessPolicy.allowsSome(undefined, BES_ADMIN_PERMISSION_GROUP);
    const queryClause = await this.createAccessPolicyQueryClause(accessPolicy);

    // If the user has BES Admin access, return the count of all tasks that match the conditions, otherwise return the count of tasks that match the conditions and the access policy
    const queryConditions = hasBESAdminAccess
      ? filtersWithColumnSelectors
      : {
          ...(queryClause ? { [QUERY_CONJUNCTIONS.RAW]: queryClause } : {}),
          ...filtersWithColumnSelectors,
        };

    return await this.count(queryConditions, {
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

  async addUserComment(message, taskId, userId) {
    const task = await this.findById(ensure(taskId));
    await task.addUserComment(message, ensure(userId));
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

  formatTaskChanges(task, originalTask = {}) {
    const { due_date: dueDate, repeat_frequency: frequency, assignee, ...restOfTask } = task;

    const taskDetails = restOfTask;

    if (
      isNotNullish(frequency) ||
      (originalTask.repeat_schedule && frequency === undefined && dueDate)
    ) {
      // if there is no due date to use, use the original task's due date (this will be the case when editing a task's repeat schedule without changing the due date)
      const dueDateToUse = dueDate || originalTask.due_date;

      // if there is no due date to use, throw an error - this should never happen but is a safety check
      if (!dueDateToUse) {
        throw new Error('Must have a due date');
      }

      // if frequency is explicitly set, use that, otherwise use the original task's frequency. This is for when editing a repeating task's due date, because we will want to update the 'dtstart' of the rrule
      const frequencyToUse = frequency ?? originalTask.repeat_schedule?.freq;
      // if task is repeating, generate rrule
      const rrule = generateRRule(dueDateToUse, frequencyToUse);
      // set repeat_schedule to the original options object so we can use it to generate next occurrences and display the schedule
      taskDetails.repeat_schedule = rrule.origOptions;
    }

    // if frequency is explicitly set to null, set repeat_schedule to null
    if (frequency === null) {
      taskDetails.repeat_schedule = null;
    }

    // if there is a due date, convert it to unix
    if (dueDate) {
      const unix = new Date(dueDate).getTime();

      taskDetails.due_date = unix;
    }

    if (assignee !== undefined) {
      taskDetails.assignee_id = assignee?.value ?? null;
    }

    return taskDetails;
  }

  /**
   * @description Format the tasks response with comments for the client
   * @param {import('@tupaia/types').DatatrakWebTasksRequest.RawTaskResult[]} tasks
   * @returns {Promise<import('@tupaia/types').DatatrakWebTasksRequest.ResBody['tasks']>}
   */
  async formatTasksWithComments(tasks) {
    const formattedTasks = await Promise.all(
      tasks.map(async task => {
        const [formattedTask, commentsCount] = await Promise.all([
          this.formatTaskForClient(task),
          this.otherModels.taskComment.count({
            task_id: task.id,
            type: TaskCommentType.user,
          }),
        ]);

        return {
          ...formattedTask,
          commentsCount,
        };
      }),
    );

    return formattedTasks;
  }

  /**
   * Format the task response for the client
   * @param {import('@tupaia/types').DatatrakWebTasksRequest.RawTaskResult} task
   * @returns {Promise<import('@tupaia/types').DatatrakWebTasksRequest.TaskResponse>}
   */
  async formatTaskForClient(task) {
    const {
      entity_id: entityId,
      'entity.name': entityName,
      'entity.code': entityCode,
      'entity.country_code': entityCountryCode,
      'survey.code': surveyCode,
      survey_id: surveyId,
      'survey.name': surveyName,
      task_status: taskStatus,
      repeat_schedule: repeatSchedule,
      assignee_id: assigneeId,
      assignee_name: assigneeName,
      model: _,
      ...rest
    } = task;

    const { project_id: projectId } = await this.otherModels.survey.findById(surveyId, {
      fields: ['project_id'],
    });
    const parentName = await this.otherModels.entity.getParentEntityName(projectId, entityId);

    const formattedTask = {
      ...rest,
      assignee: {
        id: assigneeId,
        name: assigneeName,
      },
      entity: {
        id: entityId,
        name: entityName,
        code: entityCode,
        countryCode: entityCountryCode,
        parentName,
      },
      survey: {
        id: surveyId,
        name: surveyName,
        code: surveyCode,
      },
      taskStatus,
      repeatSchedule,
    };

    return camelcaseKeys(formattedTask, {
      deep: true,
    });
  }

  async countUnassignedTasks(projectId) {
    return await this.count(
      {
        ...getTaskMetricsBaseQuery(projectId),
        status: {
          comparator: 'NOT IN',
          comparisonValue: [TaskStatus.completed, TaskStatus.cancelled],
        },
        assignee_id: {
          comparator: 'IS',
          comparisonValue: null,
        },
      },
      getTaskMetricsBaseJoin(),
    );
  }

  async countOverdueTasks(projectId) {
    return await this.count(
      {
        ...getTaskMetricsBaseQuery(projectId),
        status: {
          comparator: 'NOT IN',
          comparisonValue: [TaskStatus.completed, TaskStatus.cancelled],
        },
        due_date: {
          comparator: '<=',
          comparisonValue: new Date().getTime(),
        },
      },
      getTaskMetricsBaseJoin(),
    );
  }

  async findCompletedTasks(projectId) {
    return await this.find(
      {
        ...getTaskMetricsBaseQuery(projectId),
        status: TaskStatus.completed,
        repeat_schedule: {
          comparator: 'IS',
          comparisonValue: null,
        },
      },
      {
        columns: ['due_date', 'data_time', 'timezone', 'project_id'],
      },
    );
  }

  async findOnTimeCompletedTasks(completedTasks) {
    return completedTasks.filter(record => {
      if (!record.due_date || !record.data_time) {
        return false;
      }
      const { data_time: dataTime, timezone } = record;
      const offset = getOffsetForTimezone(timezone, new Date(dataTime));
      const formattedDate = `${dataTime.toString().replace(' ', 'T')}${offset}`;
      return new Date(formattedDate).getTime() <= record.due_date;
    });
  }

  async calculateOnTimeCompletionRate(projectId) {
    const completedTasks = await this.findCompletedTasks(projectId);
    const onTimeCompletedTasks = await this.findOnTimeCompletedTasks(completedTasks);
    return Math.round((onTimeCompletedTasks.length / completedTasks.length) * 100) || 0;
  }

  async assertUserHasPermissionToCreateTask(accessPolicy, taskData) {
    const { entity_id: entityId, survey_id: surveyId } = taskData;

    const entity = ensure(
      await this.otherModels.entity.findById(entityId),
      `No entity found with id ${entityId}`,
    );

    if (!accessPolicy.allows(entity.country_code)) {
      throw new Error('Need to have access to the country of the task');
    }

    const userSurveys = await this.otherModels.survey.findByAccessPolicy(
      accessPolicy,
      {},
      {
        columns: ['id', 'permission_group_id', 'country_ids'],
      },
    );
    const survey = userSurveys.find(({ id }) => id === surveyId);
    if (!survey) {
      throw new Error('Need to have access to the survey of the task');
    }

    return true;
  }

  async createRecordsPermissionFilter(accessPolicy, criteria = {}, options = {}) {
    if (hasBESAdminAccess(accessPolicy)) {
      return { dbConditions: criteria, dbOptions: options };
    }
    const dbConditions = { ...criteria };
    const dbOptions = { ...options };

    const taskPermissionsQuery = await this.createAccessPolicyQueryClause(accessPolicy);

    dbConditions[QUERY_CONJUNCTIONS.RAW] = taskPermissionsQuery;
    dbOptions.multiJoin = mergeMultiJoin(this.joins, dbOptions.multiJoin);

    return { dbConditions, dbOptions };
  }

  async completeTaskForSurveyResponse(surveyResponse) {
    const {
      id: surveyResponseId,
      survey_id: surveyId,
      entity_id: entityId,
      data_time: dataTime,
      user_id: userId,
    } = surveyResponse;
    const tasksToComplete = await this.find(
      {
        [QUERY_CONJUNCTIONS.AND]: {
          status: 'to_do',
          [QUERY_CONJUNCTIONS.OR]: {
            status: {
              comparator: 'IS',
              comparisonValue: null,
            },
          },
        },
        [QUERY_CONJUNCTIONS.RAW]: {
          sql: `(task.survey_id = ? AND task.entity_id = ? AND task.created_at <= ?)`,
          parameters: [surveyId, entityId, dataTime],
        },
      },
    );

    // If the survey response was successfully created, complete any tasks that are due
    if (tasksToComplete.length === 0) return;

    for (const task of tasksToComplete) {
      await task.handleCompletion(surveyResponseId, userId);
    }
  }
}
