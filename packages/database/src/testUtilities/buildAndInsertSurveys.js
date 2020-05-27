/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { findOrCreateDummyRecord, upsertDummyRecord } from './upsertDummyRecord';

const buildAndInsertQuestion = async (models, surveyScreen, { code, ...questionProperties }) => {
  const question = await findOrCreateDummyRecord(models.question, { code }, questionProperties);
  await upsertDummyRecord(models.surveyScreenComponent, {
    screen_id: surveyScreen.id,
    question_id: question.id,
  });
};

const buildAndInsertSurvey = async (models, { questions, code, ...surveyProperties }) => {
  const survey = await findOrCreateDummyRecord(models.survey, { code }, surveyProperties);
  const surveyScreen = await upsertDummyRecord(models.surveyScreen, { survey_id: survey.id });
  await Promise.all(questions.map(q => buildAndInsertQuestion(models, surveyScreen, q)));
};

/**
 * Will create a survey with the provided properties, containing the provided questions all on a
 * single survey screen.
 * Usage example:
 * ```js
 * await buildAndInsertSurveys([
 *   {
 *     id: 'id',
 *     code: 'code',
 *     can_repeat: true,
 *     questions: [
 *      { code: 'BCD1', text: 'Facility status?' },
 *      { code: 'BCD2', text: 'Opening hours?' },
 *     ],
 *   },
 *   ..., // can handle more than one survey
 * ]);
 * ```
 */
export const buildAndInsertSurveys = async (models, surveys) =>
  Promise.all(surveys.map(s => buildAndInsertSurvey(models, s)));
