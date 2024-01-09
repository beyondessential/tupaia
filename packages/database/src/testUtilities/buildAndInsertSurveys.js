/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { generateTestId } from './generateTestId';
import { findOrCreateDummyRecord } from './upsertDummyRecord';

const buildAndInsertQuestion = async (
  models,
  surveyScreen,
  { code, surveyScreenComponent: surveyScreenComponentFields, ...questionFields },
  dataSourceFields,
) => {
  const dataElement = await buildAndInsertDataElement(models, { code, ...dataSourceFields });
  const question = await findOrCreateDummyRecord(
    models.question,
    { code },
    { type: 'FreeText', ...questionFields, data_element_id: dataElement.id },
  );
  const surveyScreenComponent = await findOrCreateDummyRecord(
    models.surveyScreenComponent,
    {
      screen_id: surveyScreen.id,
      question_id: question.id,
    },
    { ...surveyScreenComponentFields },
  );
  return { question, dataElement, surveyScreenComponent };
};

const buildAndInsertDataGroup = async (models, fields) => {
  const { code, type, ...createFields } = fields;
  return findOrCreateDummyRecord(
    models.dataGroup,
    { code },
    { service_type: 'tupaia', ...createFields },
  );
};

const buildAndInsertProject = async models => {
  const uniqueId = generateTestId();
  return findOrCreateDummyRecord(
    models.project,
    { id: uniqueId },
    { id: uniqueId, code: uniqueId },
  );
};

const buildAndInsertDataElement = async (models, fields) => {
  const { code, type, ...createFields } = fields;
  return findOrCreateDummyRecord(
    models.dataElement,
    { code },
    { service_type: 'tupaia', ...createFields },
  );
};

export const buildAndInsertSurvey = async (
  models,
  { dataGroup: dataSourceFields, questions: questionFields = [], code, ...surveyFields },
) => {
  const dataGroup = await buildAndInsertDataGroup(models, { code, ...dataSourceFields });

  const project = await buildAndInsertProject(models);

  const survey = await findOrCreateDummyRecord(
    models.survey,
    { code },
    { ...surveyFields, data_group_id: dataGroup.id, project_id: project.id },
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
  return Promise.all(surveys.map(survey => buildAndInsertSurvey(models, survey)));
};
