/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { ConfigImporter } from '../../../../../apiV2/import/importSurveys/ConfigImporter';
import { ConfigValidator } from '../../../../../apiV2/import/importSurveys/Validator/ConfigValidator';
import { QuestionConfigCellBuilder } from '../../../../../apiV2/export/exportSurveys/cellBuilders';

const addConfigToQuestion = (questions, questionCode, config) =>
  questions.map(question => (question.code === questionCode ? { ...question, config } : question));

export const cellBuilderModelsStub = questions => {
  return {
    question: {
      findById: inputId => questions.find(({ id }) => id === inputId) || null,
      findIdByCode: inputCodes =>
        questions
          .filter(({ code }) => inputCodes.includes(code))
          .reduce((acc, { code, id }) => ({ ...acc, [code]: id }), {}),
      findOne: ({ code: searchCode }) => questions.find(({ code }) => searchCode === code),
    },
    entity: {
      getEntityTypes: () => ['school', 'facility'],
    },
  };
};

const processAndBuildConfig = async (questions, questionCode, config) => {
  const questionsWithConfig = addConfigToQuestion(questions, questionCode, config);
  const models = cellBuilderModelsStub(questionsWithConfig);
  const questionIndex = questionsWithConfig.findIndex(({ code }) => code === questionCode);
  const questionType = questionsWithConfig.find(({ code }) => code === questionCode).type;
  const configValidator = new ConfigValidator(questionsWithConfig, models);
  const configImporter = new ConfigImporter(models, questionsWithConfig);
  const questionConfigCellBuilder = new QuestionConfigCellBuilder(models);

  await configValidator.validate(questionIndex); // Validate acceptable config
  const parsedConfig = configImporter.parse(config); // Parse from string to json
  const input = await configImporter.process(parsedConfig, questionType); // Convert from excel to db format
  const output = await questionConfigCellBuilder.build(questionType, input); // Convert from db format to excel

  return output;
};

export const assertCanProcessAndBuild = async (questions, questionCode, config) => {
  const output = await processAndBuildConfig(questions, questionCode, config);
  return expect(output).toBe(config);
};

export const assertThrowsWhenBuilding = async (questions, questionCode, config, error) => {
  await expect(processAndBuildConfig(questions, questionCode, config)).toBeRejectedWith(error);
};
