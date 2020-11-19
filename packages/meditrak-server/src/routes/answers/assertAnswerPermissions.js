/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { QUERY_CONJUNCTIONS, TYPES } from '@tupaia/database';
import { hasBESAdminAccess } from '../../permissions';
import {
  assertSurveyResponsePermissions,
  createSurveyResponseDBFilter,
} from '../surveyResponses';

const { RAW } = QUERY_CONJUNCTIONS;

export const assertAnswerPermissions = async (accessPolicy, models, answerId) => {
  const answer = await models.answer.findById(answerId);
  if (!answer) {
    throw new Error(`No answer exists with id ${answerId}`);
  }

  await assertSurveyResponsePermissions(accessPolicy, models, answer.survey_response_id);

  return true;
};

export const assertAnswerEditPermissions = async (accessPolicy, models, answerId, updatedFields) => {
  // Forbid editing the survey response id into a survey response we don't have permission to access
  if (updatedFields.survey_response_id) {
    await assertSurveyResponsePermissions(accessPolicy, models, answer.survey_response_id);
  }
  return true;
};

export const createAnswerDBFilter = async (accessPolicy, models, criteria, options) => {
  const dbConditions = { ...criteria };
  const dbOptions = { ...options };

  if (hasBESAdminAccess(accessPolicy)) {
    return { dbConditions, dbOptions };
  }

  const allPermissionGroupsNames = accessPolicy.getPermissionGroups();
  const countryCodesByPermissionGroupId = {};

  // Generate lists of country codes we have access to per permission group id
  for (const permissionGroupName of allPermissionGroupsNames) {
    const permissionGroup = await models.permissionGroup.findOne({ name: permissionGroupName });
    if (permissionGroup) {
      const countryNames = accessPolicy.getEntitiesAllowed(permissionGroupName);
      countryCodesByPermissionGroupId[permissionGroup.id] = countryNames;
    }
  }

  // Join SQL table with survey_response, entity and survey tables
  // Running the permissions filtering is much faster with joins
  dbOptions.multiJoin = [
    {
      joinWith: TYPES.SURVEY_RESPONSE,
      joinCondition: [`${TYPES.SURVEY_RESPONSE}.id`, `${TYPES.ANSWER}.survey_response_id`],
    },
    {
      joinWith: TYPES.SURVEY,
      joinCondition: [`${TYPES.SURVEY}.id`, `${TYPES.SURVEY_RESPONSE}.survey_id`],
    },
    {
      joinWith: TYPES.ENTITY,
      joinCondition: [`${TYPES.ENTITY}.id`, `${TYPES.SURVEY_RESPONSE}.entity_id`],
    },
  ];

  // If columns weren't specified, avoid returning the joined columns
  if (!dbOptions.columns) {
    dbOptions.columns = ['answer.*'];
  }

  // Check the country code of the entity exists in our list for the permission group
  // of the survey
  dbConditions[RAW] = {
    sql: `
    (
      ARRAY[entity.country_code]::TEXT[]
      <@
      ARRAY(
        SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->survey.permission_group_id)::TEXT)
      )
    )`,
    parameters: JSON.stringify(countryCodesByPermissionGroupId),
  };

  return { dbConditions, dbOptions };
};
