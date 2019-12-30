/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import {
  upsertQuestion,
  upsertSurvey,
  upsertSurveyScreen,
  upsertSurveyScreenComponent,
} from './upsertRecord';

/**
 * Usage example:
 * ```js
 * await insertSurveyAndScreens({
 *   survey: { id: 'id', code: 'code', can_repeat: true },
 *   screens: [
 *     [
 *       { type: 'FreeText', code: 'questionCode1' },
 *       { type: 'Number', code: 'questionCode2' }
 *     ]
 *   ],
 * });
 * ```
 */
export const insertSurveyAndScreens = async ({ survey: surveyData, screens: screenData }) => {
  const survey = await upsertSurvey(surveyData);
  const screens = [];
  const questions = [];
  const surveyScreenComponents = [];

  await Promise.all(
    screenData.map(async (questionDataForScreen, screenNumber) => {
      const screen = await upsertSurveyScreen({
        survey_id: survey.id,
        screen_number: screenNumber,
      });
      screens.push(screen);

      await Promise.all(
        questionDataForScreen.map(async (questionData, questionNumber) => {
          const question = await upsertQuestion(questionData);
          questions.push(question);

          const component = await upsertSurveyScreenComponent({
            question_id: question.id,
            screen_id: screen.id,
            component_number: questionNumber,
          });
          surveyScreenComponents.push(component);
        }),
      );
    }),
  );

  return { survey, screens, questions, surveyScreenComponents };
};
