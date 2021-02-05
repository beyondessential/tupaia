/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { findOrCreateDummyRecord, upsertDummyRecord } from './upsertDummyRecord';

const buildAndInsertAnswer = async (models, surveyResponse, questionCode, answerText) => {
  const question = await findOrCreateDummyRecord(models.question, { code: questionCode });
  return upsertDummyRecord(models.answer, {
    question_id: question.id,
    survey_response_id: surveyResponse.id,
    text: answerText,
  });
};

const buildAndInsertSurveyResponse = async (
  models,
  user,
  { answers: answerData, entityCode, surveyCode, ...surveyResponseProperties },
) => {
  const entity = await findOrCreateDummyRecord(models.entity, { code: entityCode });
  const survey = await findOrCreateDummyRecord(models.survey, { code: surveyCode });
  const surveyResponse = await upsertDummyRecord(models.surveyResponse, {
    user_id: user.id, // may be overridden by the properties passed in
    entity_id: entity.id,
    survey_id: survey.id,
    ...surveyResponseProperties,
  });

  const processAnswer = async ([questionCode, answerText]) =>
    buildAndInsertAnswer(models, surveyResponse, questionCode, answerText);
  const answers = await Promise.all(Object.entries(answerData).map(processAnswer));

  return { surveyResponse, answers };
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
 *
 * @returns {Array<{ surveyResponse, answers }>}
 */
export const buildAndInsertSurveyResponses = async (models, surveyResponses) => {
  const user = await upsertDummyRecord(models.user);
  return Promise.all(
    surveyResponses.map(async surveyResponse =>
      buildAndInsertSurveyResponse(models, user, surveyResponse),
    ),
  );
};
