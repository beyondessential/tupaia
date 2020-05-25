/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { findOrCreateDummyRecord, upsertDummyRecord } from './upsertDummyRecord';

const buildAndInsertAnswer = async (
  models,
  surveyResponse,
  { questionCode, ...answerProperties },
) => {
  const question = await findOrCreateDummyRecord(models.question, { code: questionCode });
  await upsertDummyRecord(models.answer, {
    question_id: question.id,
    survey_response_id: surveyResponse.id,
    ...answerProperties,
  });
};

const buildAndInsertSurveyResponse = async (
  models,
  user,
  { answers, entityCode, surveyCode, ...surveyResponseProperties },
) => {
  const entity = await findOrCreateDummyRecord(models.entity, { code: entityCode });
  const survey = await findOrCreateDummyRecord(models.survey, { code: surveyCode });
  const surveyResponse = await upsertDummyRecord(models.surveyResponse, {
    user_id: user.id, // may be overridden by the properties passed in
    entity_id: entity.id,
    survey_id: survey.id,
    ...surveyResponseProperties,
  });
  await Promise.all(answers.map(a => buildAndInsertAnswer(models, surveyResponse, a)));
};

/**
 * Will create a survey response with the provided properties, containing the provided answers.
 * Usage example:
 * ```js
 * await buildAndInsertSurveyResponses([
 *   {
 *     id: 'id',
 *     surveyCode: 'BCD',
 *     entityCode: 'DL_1',
 *     answers: [
 *      { questionCode: 'BCD1', text: 'Fully operational' },
 *      ...,
 *     ],
 *   },
 *   ..., // can handle more than one survey response
 * ]);
 * ```
 */
export const buildAndInsertSurveyResponses = async (models, surveyResponses) => {
  const user = await upsertDummyRecord(models.user);
  return Promise.all(surveyResponses.map(s => buildAndInsertSurveyResponse(models, user, s)));
};
