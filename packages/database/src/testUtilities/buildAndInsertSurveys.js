/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { findOrCreateDummyRecord } from './upsertDummyRecord';

const buildAndInsertQuestion = async (
  models,
  surveyScreen,
  { code, ...questionFields },
  dataSourceFields,
) => {
  const dataElement = await buildAndInsertDataElement(models, { code, ...dataSourceFields });
  const question = await findOrCreateDummyRecord(
    models.question,
    { code },
    { ...questionFields, data_source_id: dataElement.id },
  );
  const surveyScreenComponent = await findOrCreateDummyRecord(
    models.surveyScreenComponent,
    {
      screen_id: surveyScreen.id,
      question_id: question.id,
    },
    {},
  );
  return { question, dataElement, surveyScreenComponent };
};

const buildAndInsertDataGroup = async (models, fields) => {
  const { code, type, ...createFields } = fields;
  return findOrCreateDummyRecord(
    models.event,
    { code },
    { service_type: 'tupaia', ...createFields },
  );
};

const buildAndInsertDataElement = async (models, fields) => {
  const { code, type, ...createFields } = fields;
  return findOrCreateDummyRecord(
    models.dataSource,
    { code },
    { service_type: 'tupaia', ...createFields },
  );
};

const buildAndInsertSurvey = async (
  models,
  { dataGroup: dataSourceFields, questions: questionFields = [], code, ...surveyFields },
) => {
  const dataGroup = await buildAndInsertDataGroup(models, { code, ...dataSourceFields });

  const survey = await findOrCreateDummyRecord(
    models.survey,
    { code },
    { ...surveyFields, data_source_id: dataGroup.id },
  );
  const surveyScreen = await findOrCreateDummyRecord(
    models.surveyScreen,
    { survey_id: survey.id },
    {},
  );

  const surveyScreenComponents = [];
  const questions = [];
  const dataElements = [];

  const processQuestion = async q => {
    const { surveyScreenComponent, question, dataElement } = await buildAndInsertQuestion(
      models,
      surveyScreen,
      q,
      dataSourceFields,
    );
    surveyScreenComponents.push(surveyScreenComponent);
    questions.push(question);
    dataElements.push(dataElement);
  };
  await Promise.all(questionFields.map(processQuestion));

  return { survey, surveyScreen, surveyScreenComponents, questions, dataGroup, dataElements };
};

/**
 * Will create a survey with the provided fields, containing the provided questions all on a
 * single survey screen.
 *
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
 */
export const buildAndInsertSurveys = async (models, surveys) => {
  return Promise.all(surveys.map(async survey => buildAndInsertSurvey(models, survey)));
};
