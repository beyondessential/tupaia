import { expect } from 'chai';
import {
  buildAndInsertSurveys,
  generateTestId,
  buildAndInsertSurveyResponses,
} from '@tupaia/database';
import { expectSuccess, TestableApp, upsertEntity } from '../testUtilities';

const ENTITY_ID = generateTestId();

const questionCode = key => `TEST-${key}`;

let surveyId;

describe('resubmit surveyResponse endpoint', () => {
  const app = new TestableApp();
  const { models } = app;

  before(async () => {
    await app.grantFullAccess();

    await upsertEntity({
      id: ENTITY_ID,
      code: ENTITY_ID,
      type: 'facility',
    });

    const [{ survey }] = await buildAndInsertSurveys(models, [
      {
        id: surveyId,
        code: 'TEST_SURVEY_RESP_CRUD',
        questions: [
          { code: questionCode(1), type: 'FreeText' },
          { code: questionCode(2), type: 'FreeText' },
          { code: questionCode(3), type: 'FreeText' },
          { code: questionCode('Autocomplete'), type: 'Autocomplete' },
          { code: questionCode('Binary'), type: 'Binary' },
          { code: questionCode('Date'), type: 'Date' },
          { code: questionCode('FreeText'), type: 'FreeText' },
          { code: questionCode('Geolocate'), type: 'Geolocate' },
          { code: questionCode('Instruction'), type: 'Instruction' },
          { code: questionCode('Number'), type: 'Number' },
          { code: questionCode('Photo'), type: 'Photo' },
          { code: questionCode('Radio'), type: 'Radio', options: ['RadioA', 'RadioB'] },
          { code: questionCode('SubmissionDate'), type: 'SubmissionDate' },
          { code: questionCode('DateOfData'), type: 'DateOfData' },
        ],
      },
    ]);
    surveyId = survey.id;
  });

  after(() => {
    app.revokeAccess();
  });

  it('Should throw error when answers contain an invalid question code', async () => {
    const [surveyResponse] = await buildAndInsertSurveyResponses(models, [
      {
        surveyCode: 'TEST_SURVEY_RESP_CRUD',
        entityCode: ENTITY_ID,
        data_time: '2020-01-31T09:00:00',
        answers: { [questionCode(1)]: '123' },
      },
    ]);

    const response = await app.post(`surveyResponse/${surveyResponse.surveyResponse.id}/resubmit`, {
      body: {
        data_time: '2020-02-02T09:00:00',
        answers: {
          TEST_INV: '1236',
        },
      },
    });

    expect(response.body).to.have.keys('error');
  });

  it('Should return a successful response', async () => {
    const [surveyResponse] = await buildAndInsertSurveyResponses(models, [
      {
        surveyCode: 'TEST_SURVEY_RESP_CRUD',
        entityCode: ENTITY_ID,
        data_time: '2020-01-31T09:00:00',
        answers: { [questionCode(1)]: '123' },
      },
    ]);

    const response = await app.post(`surveyResponse/${surveyResponse.surveyResponse.id}/resubmit`, {
      body: {
        data_time: '2020-02-02T09:00:00',
        answers: {
          [questionCode(1)]: '1236',
        },
      },
    });

    expectSuccess(response);
  });

  it('Should update the survey response fields', async () => {
    const [surveyResponse] = await buildAndInsertSurveyResponses(models, [
      {
        surveyCode: 'TEST_SURVEY_RESP_CRUD',
        entityCode: ENTITY_ID,
        assessor_name: 'Jane',
        answers: { [questionCode(1)]: '123' },
      },
    ]);

    const response = await app.post(`surveyResponse/${surveyResponse.surveyResponse.id}/resubmit`, {
      body: {
        assessor_name: 'Bob',
      },
    });

    expectSuccess(response);
    const updatedSurveyResponse = await app.get(
      `surveyResponses/${surveyResponse.surveyResponse.id}`,
    );
    expect(updatedSurveyResponse.body.assessor_name).to.equal('Bob');
  });

  it('Should update an existing answer', async () => {
    const [surveyResponse] = await buildAndInsertSurveyResponses(models, [
      {
        surveyCode: 'TEST_SURVEY_RESP_CRUD',
        entityCode: ENTITY_ID,
        assessor_name: 'Jane',
        answers: { [questionCode(1)]: '123' },
      },
    ]);

    const response = await app.post(`surveyResponse/${surveyResponse.surveyResponse.id}/resubmit`, {
      body: {
        answers: { [questionCode(1)]: 'update test' },
      },
    });

    expectSuccess(response);
    const { body } = await app.get(`surveyResponses/${surveyResponse.surveyResponse.id}/answers`);
    expect(body[0].text).to.equal('update test');
  });

  it('Should create a new answer if doesnt exist', async () => {
    const [surveyResponse] = await buildAndInsertSurveyResponses(models, [
      {
        surveyCode: 'TEST_SURVEY_RESP_CRUD',
        entityCode: ENTITY_ID,
        assessor_name: 'Jane',
        answers: { [questionCode(1)]: '123' },
      },
    ]);

    const response = await app.post(`surveyResponse/${surveyResponse.surveyResponse.id}/resubmit`, {
      body: {
        answers: { [questionCode(2)]: 'hello world' },
      },
    });

    expectSuccess(response);
    const { body } = await app.get(`surveyResponses/${surveyResponse.surveyResponse.id}/answers`);
    expect(body).to.have.length(2);
    expect(body.filter(answer => answer.text === 'hello world')).to.not.be.an('undefined');
  });

  it('Should delete an answer if it already exists and the update is null', async () => {
    const [surveyResponse] = await buildAndInsertSurveyResponses(models, [
      {
        surveyCode: 'TEST_SURVEY_RESP_CRUD',
        entityCode: ENTITY_ID,
        assessor_name: 'Jane',
        answers: { [questionCode(1)]: '123' },
      },
    ]);

    const response = await app.post(`surveyResponse/${surveyResponse.surveyResponse.id}/resubmit`, {
      body: {
        answers: { [questionCode(1)]: null },
      },
    });

    expectSuccess(response);
    const { body } = await app.get(`surveyResponses/${surveyResponse.surveyResponse.id}/answers`);
    expect(body).to.have.length(0);
  });
});
