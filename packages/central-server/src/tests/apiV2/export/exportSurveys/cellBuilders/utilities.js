import sinon from 'sinon';
import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { ConfigImporter } from '../../../../../apiV2/import/importSurveys/ConfigImporter';
import { ConfigValidator } from '../../../../../apiV2/import/importSurveys/Validator/ConfigValidator';
import { QuestionConfigCellBuilder } from '../../../../../apiV2/export/exportSurveys/cellBuilders';

const addConfigToQuestion = (questions, questionCode, config) =>
  questions.map(question => (question.code === questionCode ? { ...question, config } : question));

export const cellBuilderModelsStub = questions => {
  const findByIdStub = sinon.stub().returns(null);
  findByIdStub
    .withArgs(sinon.match(sinon.match.any))
    .callsFake(inputId => questions.find(({ id }) => id === inputId) || null);

  const findIdByCodeStub = sinon.stub().returns(null);
  findIdByCodeStub
    .withArgs(sinon.match(sinon.match.any))
    .callsFake(inputCodes =>
      questions
        .filter(({ code }) => inputCodes.includes(code))
        .reduce((acc, { code, id }) => ({ ...acc, [code]: id }), {}),
    );

  const findOneStub = sinon.stub().returns(null);
  findOneStub
    .withArgs(sinon.match(sinon.match.any))
    .callsFake(({ code: searchCode }) => questions.find(({ code }) => searchCode === code));

  return {
    question: {
      findById: findByIdStub,
      findIdByCode: findIdByCodeStub,
      findOne: findOneStub,
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
  return expect(output).to.equal(config);
};

export const assertThrowsWhenBuilding = async (questions, questionCode, config, error) => {
  await expect(processAndBuildConfig(questions, questionCode, config)).to.be.rejectedWith(error);
};
