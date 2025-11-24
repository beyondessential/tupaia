import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;

import {
  buildAndInsertSurveys,
  generateId,
  findOrCreateDummyCountryEntity,
} from '@tupaia/database';
import { TestableApp, upsertEntity } from '../../../testUtilities';

const DEFAULT_POLICY = {
  PG: ['Public'],
};
const QUESTION_IDS = {
  Well: generateId(),
  Cq: generateId(),
  Sq: generateId(),
  Positive: generateId(),
};
const CASE_CODES = ['TEST_STR_LBR_CASE1', 'TEST_STR_LBR_CASE2'];
const SURVEY = {
  id: generateId(),
  code: 'TEST_SLR',
  name: 'Test - STRIVE Lab Results',
  questions: [
    {
      id: QUESTION_IDS.Well,
      code: 'TEST_STR_LBR_WELL',
      type: 'FreeText',
      name: 'Well',
      validationCriteria: { mandatory: true },
    },
    {
      id: QUESTION_IDS.Cq,
      code: 'TEST_STR_LBR_CQ',
      type: 'Number',
      name: 'CQ',
      validationCriteria: { mandatory: true },
    },
    {
      id: QUESTION_IDS.Sq,
      code: 'TEST_STR_LBR_SQ',
      type: 'Number',
      name: 'SQ',
      validationCriteria: { mandatory: true },
    },
    {
      id: QUESTION_IDS.Positive,
      code: 'TEST_STR_LBR_POSITIVE',
      type: 'Binary',
      name: 'Positive result',
      validationCriteria: { mandatory: true },
    },
  ],
};
const EXPECTED_ANSWERS_PER_LAB_RESULT = [
  [
    { question_id: QUESTION_IDS.Well, text: 'A01' },
    { question_id: QUESTION_IDS.Cq, text: '35.1104612227568' },
    { question_id: QUESTION_IDS.Sq, text: '9.25123231038543' },
    { question_id: QUESTION_IDS.Positive, text: 'Yes' },
  ],
  [
    { question_id: QUESTION_IDS.Well, text: 'A02' },
    { question_id: QUESTION_IDS.Cq, text: '31.4282224241949' },
    { question_id: QUESTION_IDS.Sq, text: '93.1398874006731' },
    { question_id: QUESTION_IDS.Positive, text: 'No' },
  ],
];
const LAB_RESULTS = {
  filePath: 'src/tests/testData/striveLabResults.xlsx',
  count: EXPECTED_ANSWERS_PER_LAB_RESULT.length,
};

const upsertEntities = async models =>
  Promise.all(
    CASE_CODES.map(caseCode =>
      upsertEntity({
        id: generateId(),
        type: models.entity.types.CASE,
        code: caseCode,
        name: caseCode,
        country_code: 'PG',
      }),
    ),
  );

const importLabResults = app =>
  app.post('import/striveLabResults').attach('striveLabResults', LAB_RESULTS.filePath);

const fetchCreatedResponseRecords = async models =>
  models.surveyResponse.find({ survey_id: SURVEY.id });

const fetchCreatedAnswerRecords = async (models, surveyResponseId) =>
  models.answer.find({ survey_response_id: surveyResponseId });

describe('POST /import/striveLabResults', async () => {
  const app = new TestableApp();
  const { models } = app;
  let response;

  before(async () => {
    const publicPermissionGroup = await models.permissionGroup.findOne({ name: 'Public' });
    const { country: pgCountry } = await findOrCreateDummyCountryEntity(models, {
      code: 'PG',
      name: 'Papua New Guinea',
    });
    const survey = {
      ...SURVEY,
      country_ids: [pgCountry.id],
      permission_group_id: publicPermissionGroup.id,
    };

    await app.grantAccess(DEFAULT_POLICY);
    await buildAndInsertSurveys(models, [survey]);
    await upsertEntities(models);

    response = await importLabResults(app);
  });

  after(() => {
    app.revokeAccess();
  });

  it('should respond with a successful http status', () => {
    expect(response).to.have.property('statusCode', 200);
  });

  it('should create a survey response record for each lab result', async () => {
    const surveyResponses = await fetchCreatedResponseRecords(models);
    expect(surveyResponses).to.have.lengthOf(LAB_RESULTS.count);
  });

  it('should create answer records for each lab result', async () => {
    const surveyResponses = await fetchCreatedResponseRecords(models);
    const answersPerLabResult = await Promise.all(
      surveyResponses.map(async ({ id: surveyResponseId }) => {
        const newAnswers = await fetchCreatedAnswerRecords(models, surveyResponseId);
        // eslint-disable-next-line camelcase
        return newAnswers.map(({ question_id, text }) => ({ question_id, text }));
      }),
    );

    expect(answersPerLabResult).to.deep.equalInAnyOrder(EXPECTED_ANSWERS_PER_LAB_RESULT);
  });

  it('should include the survey response count in the response', () => {
    expect(response).to.have.nested.property('body.count', LAB_RESULTS.count);
  });

  it('should include the ids of created records in the response', async () => {
    const surveyResponses = await fetchCreatedResponseRecords(models);
    const expectedResults = await Promise.all(
      surveyResponses.map(async ({ id: surveyResponseId }) => {
        const answers = await fetchCreatedAnswerRecords(models, surveyResponseId);
        return { surveyResponseId, answerIds: answers.map(({ id }) => id) };
      }),
    );

    expect(response).to.have.nested.property('body.results');
    expect(response.body.results).to.deep.equalInAnyOrder(expectedResults);
  });
});
