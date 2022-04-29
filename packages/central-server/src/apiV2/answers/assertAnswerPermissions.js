/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { QUERY_CONJUNCTIONS, TYPES } from '@tupaia/database';
import { hasBESAdminAccess } from '../../permissions';
import { fetchCountryCodesByPermissionGroupId, mergeMultiJoin } from '../utilities';
import { assertSurveyResponsePermissions } from '../surveyResponses';

const { RAW } = QUERY_CONJUNCTIONS;

export const assertAnswerPermissions = async (accessPolicy, models, answerId) => {
  const answer = await models.answer.findById(answerId);
  if (!answer) {
    throw new Error(`No answer exists with id ${answerId}`);
  }

  return assertSurveyResponsePermissions(accessPolicy, models, answer.survey_response_id);
};

export const assertAnswerEditPermissions = async (
  accessPolicy,
  models,
  answerId,
  updatedFields,
) => {
  // Forbid editing the survey response id into a survey response we don't have permission to access
  if (updatedFields.survey_response_id) {
    const answer = await models.answer.findById(answerId);
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

  const countryCodesByPermissionGroupId = await fetchCountryCodesByPermissionGroupId(
    accessPolicy,
    models,
  );

  // Join SQL table with survey_response, entity and survey tables
  // Running the permissions filtering is much faster with joins than records individually
  dbOptions.multiJoin = mergeMultiJoin(
    [
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
    ],
    dbOptions.multiJoin,
  );

  // Check the country code of the entity exists in our list for the permission group
  // of the survey
  dbConditions[RAW] = {
    sql: `
      entity.country_code IN (
        SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->survey.permission_group_id)::TEXT)
      )
    `,
    parameters: JSON.stringify(countryCodesByPermissionGroupId),
  };

  return { dbConditions, dbOptions };
};

export const createAnswerViaSurveyResponseDBFilter = async (
  criteria,
  options,
  surveyResponseId,
) => {
  // Filter by parent id
  const dbConditions = { ...criteria };
  dbConditions.survey_response_id = surveyResponseId;
  // Add additional sorting when requesting via parent
  const dbOptions = {
    ...options,
    sort: ['screen_number', 'component_number', ...options.sort],
  };

  // Join other tables necessary for the additional sorting entries
  dbOptions.multiJoin = mergeMultiJoin(
    [
      {
        joinWith: TYPES.SURVEY_RESPONSE,
        joinCondition: [`${TYPES.SURVEY_RESPONSE}.id`, `${TYPES.ANSWER}.survey_response_id`],
      },
      {
        joinWith: TYPES.SURVEY_SCREEN,
        joinCondition: [`${TYPES.SURVEY_SCREEN}.survey_id`, `${TYPES.SURVEY_RESPONSE}.survey_id`],
      },
      {
        joinWith: TYPES.SURVEY_SCREEN_COMPONENT,
        joinConditions: [
          [`${TYPES.ANSWER}.question_id`, `${TYPES.SURVEY_SCREEN_COMPONENT}.question_id`],
          [`${TYPES.SURVEY_SCREEN}.id`, `${TYPES.SURVEY_SCREEN_COMPONENT}.screen_id`],
        ],
      },
    ],
    dbOptions.multiJoin,
  );

  return { dbConditions, dbOptions };
};
