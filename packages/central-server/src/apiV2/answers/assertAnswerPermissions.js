/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { JOIN_TYPES, QUERY_CONJUNCTIONS, RECORDS } from '@tupaia/database';
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
        joinWith: RECORDS.SURVEY_RESPONSE,
        joinCondition: [`${RECORDS.SURVEY_RESPONSE}.id`, `${RECORDS.ANSWER}.survey_response_id`],
      },
      {
        joinWith: RECORDS.SURVEY,
        joinCondition: [`${RECORDS.SURVEY}.id`, `${RECORDS.SURVEY_RESPONSE}.survey_id`],
      },
      {
        joinWith: RECORDS.ENTITY,
        joinCondition: [`${RECORDS.ENTITY}.id`, `${RECORDS.SURVEY_RESPONSE}.entity_id`],
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
    // use the specified sort order first, so the the results get correctly sorted
    sort: [...options.sort, 'screen_number', 'component_number'],
  };

  // Join other tables necessary for the additional sorting entries
  dbOptions.multiJoin = mergeMultiJoin(
    [
      {
        joinWith: RECORDS.SURVEY_RESPONSE,
        joinCondition: [`${RECORDS.SURVEY_RESPONSE}.id`, `${RECORDS.ANSWER}.survey_response_id`],
      },
      {
        joinWith: RECORDS.ENTITY,
        joinCondition: [`${RECORDS.ENTITY}.id`, `${RECORDS.ANSWER}.text`],
        joinType: JOIN_TYPES.LEFT,
      },
      {
        joinWith: RECORDS.SURVEY_SCREEN,
        joinCondition: [
          `${RECORDS.SURVEY_SCREEN}.survey_id`,
          `${RECORDS.SURVEY_RESPONSE}.survey_id`,
        ],
      },
      {
        joinWith: RECORDS.SURVEY_SCREEN_COMPONENT,
        joinConditions: [
          [`${RECORDS.ANSWER}.question_id`, `${RECORDS.SURVEY_SCREEN_COMPONENT}.question_id`],
          [`${RECORDS.SURVEY_SCREEN}.id`, `${RECORDS.SURVEY_SCREEN_COMPONENT}.screen_id`],
        ],
      },
      {
        joinWith: RECORDS.USER_ACCOUNT,
        joinCondition: [`${RECORDS.USER_ACCOUNT}.id`, `${RECORDS.ANSWER}.text`],
        joinType: JOIN_TYPES.LEFT,
      },
    ],
    dbOptions.multiJoin,
  );

  return { dbConditions, dbOptions };
};
