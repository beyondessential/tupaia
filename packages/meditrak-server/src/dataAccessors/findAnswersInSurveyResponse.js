/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { TYPES, JOIN_TYPES, runDatabaseFunctionInBatches } from '@tupaia/database';

/**
 * Returns the answers to a given survey response in the order they appear in the survey
 * @param {models}    models           An instance of ModelRegistry
 * @param {string}    surveyResponseIdOrIds
 * @param {object}    criteria         The criteria to filter the query
 * @param {object}    options          Additional database query options, such as join information
 * @param {string}    queryMethod      The database query method to use, either 'find' or 'count'
 */
export const findAnswersInSurveyResponse = async (
  models,
  surveyResponseIdOrIds,
  criteria,
  options = { sort: [] },
  queryMethod = 'find',
) => {
  const findOnlyOptions =
    queryMethod === 'find'
      ? {
          ...options,
          columns: [
            { [`${TYPES.QUESTION}.id`]: 'question.id' },
            { text: 'answer.text' },
            { [`${TYPES.QUESTION}.text`]: 'question.text' },
            { type: 'question.type' },
            ...(options.columns ? options.columns : []),
          ],
          sort: ['screen_number', 'component_number', ...options.sort],
        }
      : {};

  const queryDatabase = surveyResponseIdFilter =>
    models.database[queryMethod](
      TYPES.SURVEY_RESPONSE,
      { survey_response_id: surveyResponseIdFilter, ...criteria },
      {
        ...findOnlyOptions,
        multiJoin: [
          {
            joinWith: TYPES.SURVEY_SCREEN,
            joinCondition: [
              `${TYPES.SURVEY_SCREEN}.survey_id`,
              `${TYPES.SURVEY_RESPONSE}.survey_id`,
            ],
          },
          {
            joinWith: TYPES.SURVEY_SCREEN_COMPONENT,
            joinCondition: [
              `${TYPES.SURVEY_SCREEN}.id`,
              `${TYPES.SURVEY_SCREEN_COMPONENT}.screen_id`,
            ],
          },
          {
            joinWith: TYPES.ANSWER,
            joinType: JOIN_TYPES.FULL_OUTER,
            joinConditions: [
              [`${TYPES.ANSWER}.survey_response_id`, `${TYPES.SURVEY_RESPONSE}.id`],
              [`${TYPES.ANSWER}.question_id`, `${TYPES.SURVEY_SCREEN_COMPONENT}.question_id`],
            ],
          },
          {
            joinWith: TYPES.QUESTION,
            joinCondition: [`${TYPES.QUESTION}.id`, `${TYPES.ANSWER}.question_id`],
          },
        ],
      },
    );

  // if an array of survey response ids is passed in, run in batches to allow large numbers of ids
  if (Array.isArray(surveyResponseIdOrIds)) {
    return runDatabaseFunctionInBatches(surveyResponseIdOrIds, queryDatabase);
  }
  return queryDatabase(surveyResponseIdOrIds);
};
