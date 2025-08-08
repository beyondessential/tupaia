import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { ensure } from '@tupaia/tsutils';
import { PermissionsError } from '@tupaia/utils';
import { hasBESAdminAccess } from '../../permissions';

const getUserSurveys = async (models, accessPolicy, projectId) => {
  const query = {};
  if (projectId) {
    query.project_id = projectId;
  }
  const userSurveys = await models.survey.findByAccessPolicy(accessPolicy, query, {
    columns: ['id', 'permission_group_id', 'country_ids'],
  });
  return userSurveys;
};

export const createTaskDBFilter = async (accessPolicy, models, criteria, options) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return { dbConditions: criteria, dbOptions: options };
  }
  const dbConditions = { ...criteria };
  const dbOptions = { ...options };

  const taskPermissionsQuery = await models.task.createAccessPolicyQueryClause(accessPolicy);

  dbConditions[QUERY_CONJUNCTIONS.RAW] = taskPermissionsQuery;

  return { dbConditions, dbOptions };
};

export const assertUserHasTaskPermissions = async (accessPolicy, models, taskId) => {
  const task = ensure(await models.task.findById(taskId), `No task exists with ID ${taskId}`);
  const entity = await task.entity();

  if (!accessPolicy.allows(entity.country_code)) {
    throw new PermissionsError('Need to have access to the country of the task');
  }

  const userSurveys = await getUserSurveys(models, accessPolicy);
  const survey = userSurveys.find(({ id }) => id === task.survey_id);
  if (!survey) {
    throw new PermissionsError('Need to have access to the survey of the task');
  }

  return true;
};

export const assertUserHasPermissionToCreateTask = async (accessPolicy, models, taskData) => {
  const { entity_id: entityId, survey_id: surveyId } = taskData;

  const entity = ensure(
    await models.entity.findById(entityId),
    `No entity exists with ID ${entityId}`,
  );

  if (!accessPolicy.allows(entity.country_code)) {
    throw new PermissionsError('Need to have access to the country of the task');
  }

  const userSurveys = await getUserSurveys(models, accessPolicy);
  const survey = userSurveys.find(({ id }) => id === surveyId);
  if (!survey) {
    throw new PermissionsError('Need to have access to the survey of the task');
  }

  return true;
};

export const assertUserCanEditTask = async (accessPolicy, models, taskId, newRecordData) => {
  await assertUserHasTaskPermissions(accessPolicy, models, taskId);
  if (newRecordData.entity_id) {
    const entity = ensure(
      await models.entity.findById(newRecordData.entity_id),
      `No entity exists with ID ${newRecordData.entity_id}`,
    );
    if (!accessPolicy.allows(entity.country_code)) {
      throw new PermissionsError('Need to have access to the new entity of the task');
    }
  }
  if (newRecordData.survey_id) {
    const userSurveys = await getUserSurveys(models, accessPolicy);
    const survey = userSurveys.find(({ id }) => id === newRecordData.survey_id);
    if (!survey) {
      throw new PermissionsError('Need to have access to the new survey of the task');
    }
  }
  return true;
};
