/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { QUERY_CONJUNCTIONS, TYPES } from '@tupaia/database';
import { assertSurveyEditPermissions } from '../surveys';
import { hasBESAdminAccess } from '../../permissions';
import { fetchCountryIdsByPermissionGroupId, mergeMultiJoin } from '../utilities';

const { RAW } = QUERY_CONJUNCTIONS;

export const assertQuestionEditPermissions = async (accessPolicy, models, questionId) => {
  const question = await models.question.findById(questionId);
  if (!question) {
    throw new Error(`No question exists with id ${questionId}`);
  }

  const surveyIds = await question.getSurveyIds();
  for (let i = 0; i < surveyIds.length; ++i) {
    await assertSurveyEditPermissions(
      accessPolicy,
      models,
      surveyIds[i],
      'Requires permission to all surveys the question appears in',
    );
  }

  return true;
};

export const createQuestionDBFilter = async (accessPolicy, models, criteria, options) => {
  const dbConditions = { ...criteria };
  const dbOptions = { ...options };

  if (hasBESAdminAccess(accessPolicy)) {
    return { dbConditions, dbOptions };
  }

  const countryIdsByPermissionGroupId = await fetchCountryIdsByPermissionGroupId(
    accessPolicy,
    models,
  );

  dbOptions.multiJoin = mergeMultiJoin(
    [
      {
        joinWith: TYPES.SURVEY_SCREEN_COMPONENT,
        joinCondition: [`${TYPES.SURVEY_SCREEN_COMPONENT}.question_id`, `${TYPES.QUESTION}.id`],
      },
      {
        joinWith: TYPES.SURVEY_SCREEN,
        joinCondition: [`${TYPES.SURVEY_SCREEN}.id`, `${TYPES.SURVEY_SCREEN_COMPONENT}.screen_id`],
      },
      {
        joinWith: TYPES.SURVEY,
        joinCondition: [`${TYPES.SURVEY}.id`, `${TYPES.SURVEY_SCREEN}.survey_id`],
      },
    ],
    dbOptions.multiJoin,
  );

  dbConditions[RAW] = {
    sql: `
    (
      survey.country_ids
      &&
      ARRAY(
        SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->survey.permission_group_id)::TEXT)
      )
    )`,
    parameters: JSON.stringify(countryIdsByPermissionGroupId),
  };

  return { dbConditions, dbOptions };
};
