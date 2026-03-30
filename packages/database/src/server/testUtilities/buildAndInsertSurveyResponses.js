import keyBy from 'lodash.keyby';

import { buildAndInsertSurveys } from './buildAndInsertSurveys';
import { findOrCreateDummyRecord, upsertDummyRecord } from './upsertDummyRecord';

const buildAndInsertAnswer = async (models, surveyResponse, question, answerText) =>
  upsertDummyRecord(models.answer, {
    question_id: question.id,
    survey_response_id: surveyResponse.id,
    text: answerText,
    type: question.type,
  });

const buildAndInsertSurveyResponse = async (
  models,
  user,
  { answers: answerData, entityCode, surveyCode, ...surveyResponseFields },
) => {
  const entity = await findOrCreateDummyRecord(models.entity, { code: entityCode });

  const surveyConfig = {
    code: surveyCode,
    questions: Object.keys(answerData).map(code => ({ code })),
  };
  const [{ survey, questions }] = await buildAndInsertSurveys(models, [surveyConfig]);

  const surveyResponse = await upsertDummyRecord(models.surveyResponse, {
    user_id: user.id, // may be overridden by the fields passed in
    entity_id: entity.id,
    survey_id: survey.id,
    ...surveyResponseFields,
  });

  const questionsByCode = keyBy(questions, 'code');
  const processAnswer = async ([questionCode, answerText]) => {
    const question = questionsByCode[questionCode];
    return buildAndInsertAnswer(models, surveyResponse, question, answerText);
  };
  const answers = await Promise.all(Object.entries(answerData).map(processAnswer));

  return { surveyResponse, answers };
};

/**
 * Will create a survey response with the provided fields, containing the provided answers.
 *
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
export const buildAndInsertSurveyResponses = async (models, surveyResponses, userData = {}) => {
  const user = await upsertDummyRecord(models.user, userData);
  const builtResponses = [];
  for (let i = 0; i < surveyResponses.length; i++) {
    const surveyResponse = surveyResponses[i];
    const builtResponse = await buildAndInsertSurveyResponse(models, user, surveyResponse);
    builtResponses.push(builtResponse);
  }
  return builtResponses;
};
