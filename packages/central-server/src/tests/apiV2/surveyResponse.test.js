import { expect } from 'chai';
import moment from 'moment';

import { buildAndInsertSurveys, generateId, upsertDummyRecord } from '@tupaia/database';
import { oneSecondSleep, randomIntBetween } from '@tupaia/utils';
import {
  expectError,
  expectErrors,
  expectSuccess,
  setupDummySyncQueue,
  TestableApp,
  upsertEntity,
  upsertFacility,
  upsertQuestion,
} from '../testUtilities';

const getRandomSurveyResponse = async models => {
  const surveyResponses = await models.surveyResponse.all();
  return surveyResponses[randomIntBetween(0, surveyResponses.length - 1)];
};

const getRandomNewEntityForSurveyResponse = async (models, surveyResponse) => {
  const entities = await models.entity.find({
    id: {
      comparator: '!=',
      comparisonValue: surveyResponse.entity_id,
    },
  });

  return entities[randomIntBetween(0, entities.length - 1)].id;
};

const ENTITY_ID = generateId();
const ENTITY_NON_CLINIC_ID = generateId();

const questionCode = key => `TEST-${key}`;

const expectValidationError = (response, expectedError) =>
  expectErrors(response, expectedError, 400);

let surveyId;

describe('surveyResponse endpoint', () => {
  const app = new TestableApp();
  const { models } = app;

  before(async () => {
    await app.grantFullAccess();

    const publicUser = await upsertDummyRecord(models.user, { email: 'public@tupaia.org' });
    const country = await upsertDummyRecord(models.country);
    const geographicalArea = await upsertDummyRecord(models.geographicalArea, {
      country_id: country.id,
    });
    await upsertFacility({
      code: ENTITY_ID,
      geographical_area_id: geographicalArea.id,
      country_id: geographicalArea.country_id,
    });

    await upsertEntity({
      id: ENTITY_ID,
      code: ENTITY_ID,
      type: 'facility',
    });

    await upsertEntity({
      id: ENTITY_NON_CLINIC_ID,
      code: ENTITY_NON_CLINIC_ID,
      type: 'village',
    });

    // This question will not be part of the survey
    await upsertQuestion({
      code: questionCode('unattached'),
      type: 'FreeText',
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

  it('Should accept a single submission', async () => {
    const response = await app.post('surveyResponse', {
      body: {
        survey_id: surveyId,
        entity_id: ENTITY_ID,
        timestamp: 123,
        answers: {
          [questionCode(1)]: '123',
        },
      },
    });

    expectSuccess(response);

    const { body } = response;
    expect(body.results).to.have.length(1);
    expect(body.results[0].answerIds).to.have.length(1);
  });

  it('Should accept multiple answers in a submission', async () => {
    const response = await app.post('surveyResponse', {
      body: {
        survey_id: surveyId,
        entity_id: ENTITY_ID,
        timestamp: 123,
        answers: {
          [questionCode(1)]: '123',
          [questionCode(2)]: '456',
        },
      },
    });

    expectSuccess(response);
    const { body } = response;
    expect(body.results).to.have.length(1);
    expect(body.results[0].answerIds).to.have.length(2);
  });

  it('Should pair a submission to a clinic where one exists', async () => {
    const response = await app.post('surveyResponse', {
      body: {
        survey_id: surveyId,
        entity_id: ENTITY_ID,
        timestamp: 123,
        answers: {
          [questionCode(1)]: '123',
          [questionCode(2)]: '456',
        },
      },
    });

    expectSuccess(response);
    const { body } = response;
    expect(body.results[0]).to.have.property('surveyResponseId');

    const { surveyResponseId } = body.results[0];

    const dbResponse = await models.surveyResponse.findById(surveyResponseId);
    const entity = await models.entity.findById(dbResponse.entity_id);
    const clinic = await models.facility.findOne({ code: entity.code });
    expect(clinic).to.not.be.null;
  });

  it("Should not pair a submission to a clinic if there isn't one", async () => {
    const response = await app.post('surveyResponse', {
      body: {
        survey_id: surveyId,
        entity_id: ENTITY_NON_CLINIC_ID,
        timestamp: 123,
        answers: {
          [questionCode(1)]: '123',
          [questionCode(2)]: '456',
        },
      },
    });

    expectSuccess(response);

    const { body } = response;
    expect(body.results[0]).to.have.property('surveyResponseId');

    const { surveyResponseId } = body.results[0];
    const dbResponse = await models.surveyResponse.findById(surveyResponseId);
    expect(dbResponse).to.not.be.null;
    const entity = await models.entity.findById(dbResponse.entity_id);
    const clinic = await models.facility.findOne({ code: entity.code });
    expect(clinic).to.be.null;

    expect(surveyResponseId).to.not.be.null;
  });

  it('Should accept multiple submissions', async () => {
    const response = await app.post('surveyResponse', {
      body: [
        {
          survey_id: surveyId,
          entity_id: ENTITY_ID,
          timestamp: 123,
          answers: {
            [questionCode(1)]: '123',
          },
        },
        {
          survey_id: surveyId,
          entity_id: ENTITY_ID,
          timestamp: 456,
          answers: {
            [questionCode(1)]: '456',
            [questionCode(2)]: '789',
          },
        },
      ],
    });

    expectSuccess(response);

    const { body } = response;
    expect(body.results).to.have.length(2);
    expect(body.results[0].answerIds).to.have.length(1);
    expect(body.results[1].answerIds).to.have.length(2);
  });

  it('Should throw if a submission has an invalid survey id', async () => {
    const response = await app.post('surveyResponse', {
      body: {
        survey_id: 'NOT_REAL',
        entity_id: ENTITY_ID,
        timestamp: 123,
        answers: {
          [questionCode(1)]: '123',
        },
      },
    });

    expectValidationError(response, /survey_id/);
  });

  it('Should throw if a submission has a missing entity code', async () => {
    const response = await app.post('surveyResponse', {
      body: {
        survey_id: surveyId,
        timestamp: 123,
        answers: {
          [questionCode(1)]: '123',
        },
      },
    });

    expectValidationError(response, /entity_id/);
    expectValidationError(response, /Must provide one of/);
  });

  it('Should throw if a submission has an invalid entity id', async () => {
    const response = await app.post('surveyResponse', {
      body: {
        survey_id: surveyId,
        entity_id: 'NOT_REAL_000000000000000',
        timestamp: 123,
        answers: {
          [questionCode(1)]: '123',
        },
      },
    });

    expectValidationError(response, /No entity with id/);
  });

  it('Should throw if a submission has an invalid entity code', async () => {
    const response = await app.post('surveyResponse', {
      body: {
        survey_id: surveyId,
        entity_code: 'NOT_REAL',
        timestamp: 123,
        answers: {
          [questionCode(1)]: '123',
        },
      },
    });

    expectValidationError(response, /No entity with code/);
  });

  it('Should throw if a submission has an invalid question code', async () => {
    const response = await app.post('surveyResponse', {
      body: {
        survey_id: surveyId,
        entity_id: ENTITY_ID,
        timestamp: 123,
        answers: {
          NOT_REAL: '123',
        },
      },
    });

    expectValidationError(response, /Could not find question/);
  });

  it('Should throw if a question is not present on the selected survey', async () => {
    const response = await app.post('surveyResponse', {
      body: {
        survey_id: surveyId,
        entity_id: ENTITY_ID,
        timestamp: 123,
        answers: {
          [questionCode('unattached')]: '123',
        },
      },
    });

    expectValidationError(response, /Could not find question/);
  });

  it('Should allow a survey response with no answers', async () => {
    const response = await app.post('surveyResponse', {
      body: {
        survey_id: surveyId,
        entity_id: ENTITY_ID,
        timestamp: 123,
        answers: {},
      },
    });

    expectSuccess(response);
    const { body } = response;
    expect(body.results).to.have.length(1);
    expect(body.results[0].surveyResponseId).to.not.be.undefined;
    expect(body.results[0].answerIds).to.have.length(0);
  });

  it('Should throw if a survey has an answer with no content', async () => {
    const response = await app.post('surveyResponse', {
      body: {
        survey_id: surveyId,
        entity_id: ENTITY_ID,
        timestamp: 123,
        answers: {
          [questionCode(1)]: null,
          [questionCode(2)]: '123',
        },
      },
    });

    expectValidationError(response, /is missing value/);
  });

  it('Should throw if a survey is missing a timestamp', async () => {
    const response = await app.post('surveyResponse', {
      body: {
        survey_id: surveyId,
        entity_id: ENTITY_ID,
        answers: {
          [questionCode(1)]: '123',
        },
      },
    });

    expectError(response, /Must provide .* or timestamp/, 400);
  });

  it('Should handle timezones correctly', async () => {
    const timezones = [
      'Etc/GMT-13',
      'Pacific/Apia',
      'Pacific/Enderbury',
      'Pacific/Fakaofo',
      'Pacific/Tongatapu',
      'Antarctica/McMurdo', // +13 during DST
    ];
    const timestamp = '2019-07-31T06:48:00+13:00';
    const response = await app.post('surveyResponse', {
      body: {
        survey_id: surveyId,
        entity_id: ENTITY_ID,
        timestamp,
        answers: {
          [questionCode(1)]: '123',
        },
      },
    });

    const { body } = response;
    expectSuccess(response);

    const { surveyResponseId } = body.results[0];
    const dbResponse = await models.surveyResponse.findOne({ id: surveyResponseId });
    expect(dbResponse.timezone).to.be.oneOf(timezones);
    expect(moment(dbResponse.data_time).format('YYYY-MM-DDTHH:mm:ss.SSS')).to.equal(
      '2019-07-30T17:48:00.000',
    );
  });

  it('Should use start and end times if provided', async () => {
    const response = await app.post('surveyResponse', {
      body: {
        survey_id: surveyId,
        entity_id: ENTITY_ID,
        timestamp: '2021-01-01T23:59:59Z',
        start_time: '2021-02-01T23:59:59Z',
        end_time: '2021-03-01T23:59:59Z',
        answers: {
          [questionCode(1)]: '123',
        },
      },
    });

    const { body } = response;
    expectSuccess(response);

    const { surveyResponseId } = body.results[0];
    const dbResponse = await models.surveyResponse.findOne({ id: surveyResponseId });
    expect(moment(dbResponse.data_time).format('YYYY-MM-DDTHH:mm:ss.SSS')).to.equal(
      '2021-01-01T23:59:59.000',
    );
    expect(moment(dbResponse.start_time).isSame('2021-02-01T23:59:59.000Z')).to.be.true;
    expect(moment(dbResponse.end_time).isSame('2021-03-01T23:59:59.000Z')).to.be.true;
  });

  it('Should use timestamp as start and end times if not provided', async () => {
    const response = await app.post('surveyResponse', {
      body: {
        survey_id: surveyId,
        entity_id: ENTITY_ID,
        timestamp: '2021-01-01T23:59:59Z',
        answers: {
          [questionCode(1)]: '123',
        },
      },
    });

    const { body } = response;
    expectSuccess(response);

    const { surveyResponseId } = body.results[0];
    const dbResponse = await models.surveyResponse.findOne({ id: surveyResponseId });
    expect(moment(dbResponse.data_time).format('YYYY-MM-DDTHH:mm:ss.SSS')).to.equal(
      '2021-01-01T23:59:59.000',
    );
    expect(moment(dbResponse.start_time).isSame('2021-01-01T23:59:59.000Z')).to.be.true;
    expect(moment(dbResponse.end_time).isSame('2021-01-01T23:59:59.000Z')).to.be.true;
  });

  it('Should support submitting survey responses with the public user', async () => {
    const response = await app.post('surveyResponse?submitAsPublic=true', {
      body: {
        survey_id: surveyId,
        entity_id: ENTITY_ID,
        timestamp: 123,
        answers: {
          [questionCode(1)]: '123',
        },
      },
    });

    expectSuccess(response);

    const { body } = response;
    const { surveyResponseId } = body.results[0];
    const { user_id } = await models.surveyResponse.findById(surveyResponseId);
    const user = await models.user.findById(user_id);
    expect(user.email).to.equal('public@tupaia.org');
  });

  it('Submits survey responses with the logged in user by default', async () => {
    const response = await app.post('surveyResponse', {
      body: {
        survey_id: surveyId,
        entity_id: ENTITY_ID,
        timestamp: 123,
        answers: {
          [questionCode(1)]: '123',
        },
      },
    });

    expectSuccess(response);

    const { body } = response;
    const { surveyResponseId } = body.results[0];
    const { user_id } = await models.surveyResponse.findById(surveyResponseId);
    const user = await models.user.findById(user_id);
    expect(user.email).to.equal('test.user@tupaia.org');
  });

  describe('Update entity for existing survey response', async function () {
    let syncQueue;
    let surveyResponseId;
    let previousNumberOfSurveyResponses = 0;
    let previousNumberOfAnswers = 0;
    let response = {};
    let newEntityId;
    let numberOfAnswersInSurveyResponse;

    before(async () => {
      syncQueue = setupDummySyncQueue(models);
      syncQueue.clear();
      previousNumberOfSurveyResponses = await models.surveyResponse.count();
      previousNumberOfAnswers = await models.answer.count();
      const surveyResponse = await getRandomSurveyResponse(models);
      newEntityId = await getRandomNewEntityForSurveyResponse(models, surveyResponse);

      surveyResponseId = surveyResponse.id;
      numberOfAnswersInSurveyResponse = await models.answer.count({
        survey_response_id: surveyResponseId,
      });
      response = await app.put(`surveyResponses/${surveyResponseId}`, {
        body: {
          entity_id: newEntityId,
        },
      });
    });

    it('should respond with a successful http status', function () {
      expect(response.statusCode).to.equal(200);
    });

    it('should have the same number of survey responses', async function () {
      const postNumberOfSurveyResponses = await models.surveyResponse.count();
      expect(postNumberOfSurveyResponses).to.equal(previousNumberOfSurveyResponses);
    });

    it('should have the same number of answers', async function () {
      const postNumberOfAnswers = await models.answer.count();
      expect(postNumberOfAnswers).to.equal(previousNumberOfAnswers);
    });

    it('should have changed the entity associated with the survey response to the new entity', async function () {
      const surveyResponse = await models.surveyResponse.findById(surveyResponseId);
      expect(surveyResponse.entity_id).to.equal(newEntityId);
    });

    it('should add the survey response and all answers to the sync queue after it is submitted', async function () {
      this.retries(10);
      await oneSecondSleep(1000);
      expect(syncQueue.count(models.surveyResponse.databaseRecord)).to.equal(1);
      expect(syncQueue.count(models.answer.databaseRecord)).to.equal(
        numberOfAnswersInSurveyResponse,
      );
    });
  });

  describe('Type checking', () => {
    it('Should allow valid types through', async () => {
      const { body } = await app.post('surveyResponse', {
        body: {
          timestamp: 123,
          survey_id: surveyId,
          entity_id: ENTITY_ID,
          answers: {
            [questionCode('Binary')]: 'Yes',
            [questionCode('Date')]: '2019-01-01',
            [questionCode('DateOfData')]: '2019-02-02',

            [questionCode('Instruction')]: '',
            [questionCode('Number')]: '123',
            [questionCode('Radio')]: 'RadioA',

            [questionCode('Autocomplete')]: "Can't fail",
            [questionCode('FreeText')]: "Can't fail",
            [questionCode('Geolocate')]: "Can't fail",
            [questionCode('Photo')]: "Can't fail",
          },
        },
      });

      expect(body).not.to.have.property('errors');
    });

    const postTypeCheck = (type, value) =>
      app.post('surveyResponse', {
        body: {
          timestamp: 123,
          survey_id: surveyId,
          entity_id: ENTITY_ID,
          answers: { [questionCode(type)]: value },
        },
      });

    // these types do not have any validation at the moment, so, no tests

    // const { body } = await postTypeCheck("Autocomplete", "");
    // const { body } = await postTypeCheck("Photo", "");
    // const { body } = await postTypeCheck("Geolocate", "");

    it('Should reject an invalid Binary answer', async () => {
      const response = await postTypeCheck('Binary', 'Maybe');
      expectValidationError(response, /Maybe is not an accepted value/);
    });

    it('Should reject an invalid Instruction answer', async () => {
      const response = await postTypeCheck('Instruction', 'Any text');
      expectValidationError(response, /Expected empty value but got 'Any text'/);
    });

    it('Should reject an invalid Number answer', async () => {
      const response = await postTypeCheck('Number', 'Three');
      expectValidationError(response, /Should contain a number/);
    });

    it('Should reject an invalid Radio answer', async () => {
      const response = await postTypeCheck('Radio', 'RadioX');
      expectValidationError(response, /RadioX is not an accepted value/);
    });

    it('Should reject an invalid Date answer', async () => {
      const response = await postTypeCheck('Date', '1/1/2019');
      expectValidationError(response, /Dates should be in ISO 8601 format/);
    });

    it('Should reject an invalid SubmissionDate answer', async () => {
      const response = await postTypeCheck('SubmissionDate', '1/1/2019');
      expectValidationError(response, /Dates should be in ISO 8601 format/);
    });

    it('Should reject an invalid DateOfData answer', async () => {
      const response = await postTypeCheck('DateOfData', '1/1/2019');
      expectValidationError(response, /Dates should be in ISO 8601 format/);
    });
  });
});
