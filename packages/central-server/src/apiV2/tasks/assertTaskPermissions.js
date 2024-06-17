/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { RECORDS } from '@tupaia/database';
import { hasBESAdminAccess } from '../../permissions';
import { fetchCountryCodesByPermissionGroupId, mergeFilter, mergeMultiJoin } from '../utilities';

const getUserSurveys = async (models, accessPolicy, projectId) => {
  const query = {};
  if (projectId) {
    query.project_id = projectId;
  }
  const userSurveys = await models.survey.findByAccessPolicy(accessPolicy, query, {
    columns: ['id'],
  });
  return userSurveys;
};

export const createTaskDBFilter = async (accessPolicy, models, criteria, options) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return { dbConditions: criteria, dbOptions: options };
  }
  const { projectId, ...dbConditions } = { ...criteria };
  const dbOptions = { ...options };

  const countryCodesByPermissionGroupId = await fetchCountryCodesByPermissionGroupId(
    accessPolicy,
    models,
  );

  const surveys = await getUserSurveys(models, accessPolicy, projectId);

  dbConditions['entity.country_code'] = mergeFilter(
    {
      comparator: 'IN',
      comparisonValue: Object.values(countryCodesByPermissionGroupId).flat(),
    },
    dbConditions['entity.country_code'],
  );

  dbConditions['task.survey_id'] = mergeFilter(
    {
      comparator: 'IN',
      comparisonValue: surveys.map(survey => survey.id),
    },
    dbConditions['task.survey_id'],
  );

  dbOptions.multiJoin = mergeMultiJoin(
    [
      {
        joinWith: RECORDS.ENTITY,
        joinCondition: [`${RECORDS.ENTITY}.id`, `${RECORDS.TASK}.entity_id`],
      },
    ],
    dbOptions.multiJoin,
  );
  return { dbConditions, dbOptions };
};

export const assertUserHasTaskPermissions = async (accessPolicy, models, taskId) => {
  const task = await models.task.findById(taskId);
  if (!task) {
    throw new Error(`No task found with id ${taskId}`);
  }

  const entity = await task.entity();
  if (!accessPolicy.allows(entity.country_code)) {
    throw new Error('Need to have access to the country of the task');
  }

  const userSurveys = await getUserSurveys(models, accessPolicy);
  const survey = userSurveys.find(({ id }) => id === task.survey_id);
  if (!survey) {
    throw new Error('Need to have access to the survey of the task');
  }

  return true;
};

export const assertUserHasPermissionToCreateTask = async (accessPolicy, models, taskData) => {
  const { entity_id: entityId, survey_id: surveyId } = taskData;

  const entity = await models.entity.findById(entityId);
  if (!entity) {
    throw new Error(`No entity found with id ${entityId}`);
  }

  if (!accessPolicy.allows(entity.country_code)) {
    throw new Error('Need to have access to the country of the task');
  }

  const userSurveys = await getUserSurveys(models, accessPolicy);
  const survey = userSurveys.find(({ id }) => id === surveyId);
  if (!survey) {
    throw new Error('Need to have access to the survey of the task');
  }

  return true;
};

export const assertUserCanEditTask = async (accessPolicy, models, taskId, newRecordData) => {
  await assertUserHasTaskPermissions(accessPolicy, models, taskId);
  if (newRecordData.entity_id) {
    const entity = await models.entity.findById(newRecordData.entity_id);
    if (!entity) {
      throw new Error(`No entity found with id ${newRecordData.entity_id}`);
    }
    if (!accessPolicy.allows(entity.country_code)) {
      throw new Error('Need to have access to the country of the task');
    }
  }
  if (newRecordData.survey_id) {
    const userSurveys = await getUserSurveys(models, accessPolicy);
    const survey = userSurveys.find(({ id }) => id === newRecordData.survey_id);
    if (!survey) {
      throw new Error('Need to have access to the survey of the task');
    }
  }
  return true;
};
