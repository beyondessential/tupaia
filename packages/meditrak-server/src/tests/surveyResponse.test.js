import { expect } from 'chai';
import momentTimezone from 'moment-timezone';

import { buildAndInsertSurveys, generateTestId, upsertDummyRecord } from '@tupaia/database';
import { TestableApp } from './TestableApp';
import {
  upsertEntity,
  upsertFacility,
  upsertQuestion,
} from './testUtilities/database/upsertRecord';

const ENTITY_ID = generateTestId();
const ENTITY_NON_CLINIC_ID = generateTestId();

const questionCode = key => `TEST-${key}`;

function expectSuccess(response) {
  const { statusCode, body } = response;
  expect(statusCode).to.equal(200);
  expect(body.errors).to.be.undefined;
}

function expectError(response, match) {
  const { body, statusCode } = response;
  expect(statusCode).to.equal(400);
  expect(body).to.have.property('errors');
  const message = body.errors[0].error;
  expect(message).to.match(match);
}

let surveyId;

describe('surveyResponse endpoint', () => {
  const app = new TestableApp();
  const { models } = app;

  before(async () => {
    await app.authenticate();

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
      type: 'disaster',
    });

    // This question will not be part of the survey
    await upsertQuestion({
      code: questionCode('unattached'),
      type: 'FreeText',
    });

    const [{ survey }] = await buildAndInsertSurveys(models, [
      {
        id: surveyId,
        code: 'TEST_SURVEY',
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
        ],
      },
    ]);
    surveyId = survey.id;
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

  it('Should throw if a submission has an invalid survey code', async () => {
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

    expectError(response, /survey_id/);
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

    expectError(response, /entity_id/);
    expectError(response, /Must provide one of/);
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

    expectError(response, /No entity with id/);
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

    expectError(response, /No entity with code/);
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

    expectError(response, /Could not find question/);
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

    expectError(response, /Could not find question/);
  });

  it('Should throw if a survey has no answers', async () => {
    const response = await app.post('surveyResponse', {
      body: {
        survey_id: surveyId,
        entity_id: ENTITY_ID,
        timestamp: 123,
        answers: {},
      },
    });

    expectError(response, /must contain at least one answer/);
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

    expectError(response, /is missing value/);
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

    expectError(response, /timestamp/);
    expectError(response, /Should not be empty/);
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
    expect(momentTimezone.tz(dbResponse.submission_time, dbResponse.timezone).format()).to.be.oneOf(
      [
        '2019-07-31T06:48:00+13:00',
        // While 'Antarctica/McMurdo' is in DST time, it will be selected as the timezone,
        // however the timestamp is hardcoded to a date outside of DST time for McMurdo, so it will be
        // parsed with it's non-DST +12 offset.
        '2019-07-31T05:48:00+12:00',
      ],
    );
    expect(dbResponse.timezone).to.be.oneOf(timezones);
    expect(dbResponse.submission_time.toISOString()).to.equal('2019-07-30T17:48:00.000Z');
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
            [questionCode('SubmissionDate')]: '2019-02-02',

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
      expectError(response, /Maybe is not an accepted value/);
    });

    it('Should reject an invalid Instruction answer', async () => {
      const response = await postTypeCheck('Instruction', 'Any text');
      expectError(response, /Should be empty/);
    });

    it('Should reject an invalid Number answer', async () => {
      const response = await postTypeCheck('Number', 'Three');
      expectError(response, /Should contain a number/);
    });

    it('Should reject an invalid Radio answer', async () => {
      const response = await postTypeCheck('Radio', 'RadioX');
      expectError(response, /RadioX is not an accepted value/);
    });

    it('Should reject an invalid Date answer', async () => {
      const response = await postTypeCheck('Date', '1/1/2019');
      expectError(response, /Dates should be in ISO 8601 format/);
    });

    it('Should reject an invalid SubmissionDate answer', async () => {
      const response = await postTypeCheck('SubmissionDate', '1/1/2019');
      expectError(response, /Dates should be in ISO 8601 format/);
    });
  });
});
