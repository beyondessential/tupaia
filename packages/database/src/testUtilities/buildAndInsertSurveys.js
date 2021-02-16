/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { findOrCreateDummyRecord, upsertDummyRecord } from './upsertDummyRecord';

const buildAndInsertQuestion = async (models, surveyScreen, { code, ...questionProperties }) => {
  const question = await findOrCreateDummyRecord(models.question, { code }, questionProperties);
  const surveyScreenComponent = await upsertDummyRecord(models.surveyScreenComponent, {
    screen_id: surveyScreen.id,
    question_id: question.id,
  });
  return { question, surveyScreenComponent };
};

const buildAndInsertDataGroup = async (models, dataGroupProperties) =>
  findOrCreateDummyRecord(
    models.dataSource,
    {
      service_type: 'dhis',
      ...dataGroupProperties,
      type: 'dataGroup',
    },
    {
      config: { isDataRegional: false },
    },
  );

const buildAndInsertSurvey = async (
  models,
  { dataGroup: dataGroupProps, questions: questionProps = [], code, ...surveyProps },
) => {
  const dataGroup = await buildAndInsertDataGroup(models, { code, ...dataGroupProps });

  const survey = await findOrCreateDummyRecord(
    models.survey,
    { code },
    { ...surveyProps, data_source_id: dataGroup.id },
  );
  const surveyScreen = await upsertDummyRecord(models.surveyScreen, { survey_id: survey.id });

  const surveyScreenComponents = [];
  const questions = [];
  const processQuestion = async q => {
    const { surveyScreenComponent, question } = await buildAndInsertQuestion(
      models,
      surveyScreen,
      q,
    );
    surveyScreenComponents.push(surveyScreenComponent);
    questions.push(question);
  };
  await Promise.all(questionProps.map(processQuestion));

  return { survey, surveyScreen, surveyScreenComponents, questions, dataGroup };
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
 *     dataGroup: {
 *       service_type: 'tupaia'
 *     },
 *     questions: [
 *      { code: 'BCD1', text: 'Facility status?' },
 *      { code: 'BCD2', text: 'Opening hours?' },
 *     ],
 *   },
 *   ..., // can handle more than one survey
 * ]);
 * ```
 *
 * @returns {Array<{ survey, surveyScreen, surveyScreenComponents, questions, dataGroup }>}
 */
export const buildAndInsertSurveys = async (models, surveys) => {
  return Promise.all(surveys.map(async survey => buildAndInsertSurvey(models, survey)));
};
