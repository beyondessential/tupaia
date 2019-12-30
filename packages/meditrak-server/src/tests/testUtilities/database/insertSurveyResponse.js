/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { getModels } from '../../getModels';
import { upsertAnswer, upsertSurveyResponse } from './upsertRecord';

const testModels = getModels();

/**
 * Usage example:
 * ```js
 * await insertSurveyResponse({
 *   survey: { survey_id: 'surveyId' },
 *   answers: { questionCode: answerText }
 * }
 * ```
 */
export const insertSurveyResponse = async (
  { survey: surveyData, answers: answerData },
  models = testModels,
) => {
  const surveyResponse = await upsertSurveyResponse(surveyData);

  const questions = [];
  const answers = [];
  await Promise.all(
    Object.entries(answerData).map(async ([questionCode, answerText]) => {
      const question = await models.question.findOne({
        code: questionCode,
      });
      questions.push(question);

      const answer = await upsertAnswer({
        survey_response_id: surveyResponse.id,
        question_id: question.id,
        text: answerText,
      });
      answers.push(answer);
    }),
  );

  return { surveyResponse, questions, answers };
};
