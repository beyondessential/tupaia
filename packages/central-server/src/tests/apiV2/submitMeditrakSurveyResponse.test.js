/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';
import momentTimezone from 'moment-timezone';

import { expect, assert } from 'chai';
import {
  fetchWithTimeout,
  oneSecondSleep,
  randomIntBetween,
  getS3ImageFilePath,
  S3_BUCKET_NAME,
  stripTimezoneFromDate,
} from '@tupaia/utils';
import {
  generateId,
  generateTestId,
  generateValueOfType,
  TYPES,
  buildAndInsertSurveys,
  upsertDummyRecord,
  findOrCreateDummyCountryEntity,
} from '@tupaia/database';

import { TEST_IMAGE_DATA } from '../testData';
import { setupDummySyncQueue, TestableApp, upsertEntity, upsertQuestion } from '../testUtilities';

const entityId = generateTestId();
const surveyId = generateTestId();
const getQuestionId = (questionNumber = 0) => {
  const id = `4705c02a7_question_${questionNumber}_test`;
  return id.substring(id.length - 24); // Cut off excess for questions > 9
};
let userId = null; // will be determined in 'before' phase
let defaultTimezone = 'Pacific/Auckland';

const generateDummySurveyResponse = (overrideFields = {}, extraFields = {}) => {
  const { submissionTime, startTime, endTime } = overrideFields;
  const dataTime = submissionTime || endTime;
  return {
    answers: [],
    approval_status: 'not_required',
    data_time: stripTimezoneFromDate(momentTimezone(dataTime).tz(defaultTimezone).format()),
    start_time: startTime || new Date().toISOString(),
    end_time: endTime || new Date().toISOString(),
    entities_created: [],
    entity_id: entityId,
    id: generateTestId(),
    survey_id: surveyId,
    user_id: userId,
    timezone: defaultTimezone,
    ...extraFields,
  };
};

const generateDummyAnswer = questionNumber => ({
  id: generateTestId(),
  type: 'FreeText',
  body: generateValueOfType('text'),
  question_id: getQuestionId(questionNumber),
});

const generateDummyEntityDetails = () => ({
  id: generateTestId(),
  name: generateValueOfType('text'),
  country_code: 'DL',
  parent_id: entityId,
  code: generateValueOfType('text'),
  type: 'case',
  attributes: {},
});

const BUCKET_URL = 'https://s3-ap-southeast-2.amazonaws.com';

const PSQL_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const formatDateAsPSQLString = date => {
  return moment(date).tz(defaultTimezone).format(PSQL_DATE_FORMAT);
};

function expectEqualStrings(a, b) {
  try {
    return expect(a.toString()).to.equal(b.toString());
  } catch (e) {
    // Errors are thrown by the toString() method.
    return assert.fail(
      a,
      b,
      `${a} was not equal to ${b}, exception thrown probably because one or both are not strings.`,
    );
  }
}

describe('POST /surveyResponse', async () => {
  const app = new TestableApp();
  const { models } = app;
  const syncQueue = setupDummySyncQueue(models);

  before(async () => {
    defaultTimezone = (await models.database.getTimezone()).TimeZone;
  });

  describe('SubmitSurveyResponse', () => {
    before(async () => {
      await app.grantAccess({ DL: ['TEST_PERMISSION_GROUP'] });

      await findOrCreateDummyCountryEntity(models, {
        code: 'DL',
        name: 'Demo Land',
      });

      const questions = [];
      for (let i = 0; i < 20; i++) {
        const question = await upsertQuestion({ id: getQuestionId(i), code: `TEST_QUESTION_${i}` });
        questions.push(question);
      }

      const permissionGroup = await upsertDummyRecord(models.permissionGroup, {
        name: 'TEST_PERMISSION_GROUP',
      });
      await buildAndInsertSurveys(models, [
        {
          id: surveyId,
          code: 'TEST_SURVEY',
          permission_group_id: permissionGroup.id,
          questions,
        },
      ]);
      await upsertEntity({ id: entityId, code: 'TEST_ENTITY' });

      const user = await models.user.findOne();
      userId = user.id;
    });

    after(() => {
      app.revokeAccess();
    });

    describe('Supported change types in the correct format', () => {
      // Generate random test data
      const numberOfAnswersInEachSurvey = randomIntBetween(1, 20);
      const numberOfSurveyResponsesToAdd = randomIntBetween(1, 20);
      let previousNumberOfSurveyResponses = 0;
      let previousNumberOfAnswers = 0;
      let response = {};

      const surveyResponseObjects = [];

      before(async () => {
        for (let i = 0; i < numberOfSurveyResponsesToAdd; i++) {
          const surveyResponseObject = generateDummySurveyResponse({
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
          });
          for (let j = 0; j < numberOfAnswersInEachSurvey; j++) {
            surveyResponseObject.answers.push(generateDummyAnswer(j));
          }
          surveyResponseObjects.push(surveyResponseObject);
        }

        syncQueue.clear();
        previousNumberOfSurveyResponses = await models.surveyResponse.count();
        previousNumberOfAnswers = await models.answer.count();
        response = await app.post('surveyResponse', { body: surveyResponseObjects });
      });

      it('should respond with a successful http status', () => {
        expect(response.statusCode).to.equal(200);
      });

      it('should have added the correct number of survey responses', async () => {
        const postNumberOfSurveyResponses = await models.surveyResponse.count();
        const numberOfSurveyResponsesAdded =
          postNumberOfSurveyResponses - previousNumberOfSurveyResponses;
        expect(numberOfSurveyResponsesAdded).to.equal(numberOfSurveyResponsesToAdd);
      });

      it('should have added the correct number of answers', async () => {
        const postNumberOfAnswers = await models.answer.count();
        const numberOfAnswersAdded = postNumberOfAnswers - previousNumberOfAnswers;
        expect(numberOfAnswersAdded).to.equal(
          numberOfAnswersInEachSurvey * numberOfSurveyResponsesToAdd,
        );
      });

      it('should now have the first survey response in the database', async () => {
        const firstSurveyResponseObject = surveyResponseObjects[0];
        const firstSurveyResponse = await models.surveyResponse.findById(
          firstSurveyResponseObject.id,
        );
        expect(firstSurveyResponse).to.exist;
        Object.entries(firstSurveyResponseObject).forEach(([key, value]) => {
          // Other than 'answers' and 'entities_created', all values in the original object
          // should match the database
          if (!['answers', 'entities_created'].includes(key)) {
            expectEqualStrings(firstSurveyResponse[key], value);
          }
        });
      });

      it('should now have the first answer in the first survey response in the models', async () => {
        const firstSurveyResponseObject = surveyResponseObjects[0];
        const firstAnswerObject = firstSurveyResponseObject.answers[0];
        const firstAnswer = await models.answer.findById(firstAnswerObject.id);
        expect(firstAnswer).to.exist;
        Object.entries(firstAnswerObject).forEach(([key, value]) => {
          // Other than 'body', all values in the original object should match the database
          let translatedKey = key;
          if (key === 'body') {
            translatedKey = 'text';
          }
          expectEqualStrings(firstAnswer[translatedKey], value);
        });
        expectEqualStrings(firstAnswer.survey_response_id, firstSurveyResponseObject.id);
      });

      it('adds the survey response to the sync queue after it is submitted', async function () {
        this.retries(10);
        await oneSecondSleep(1000);
        expect(syncQueue.count(TYPES.SURVEY_RESPONSE), 'survey responses added').to.equal(
          numberOfSurveyResponsesToAdd,
        );
        expect(syncQueue.count(TYPES.ANSWER), 'answers added').to.equal(
          numberOfAnswersInEachSurvey * numberOfSurveyResponsesToAdd,
        );
      });
    });

    describe('Badly formatted survey responses', () => {
      it('returns an error when fields are missing from the survey responses', async () => {
        const badlyFormattedSurveyResponse = { id: generateTestId() };
        const response = await app.post('surveyResponse', {
          body: [badlyFormattedSurveyResponse],
        });
        expect(response.statusCode).to.equal(400);
      });

      it('returns an error when fields are missing from the answer', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        surveyResponseObject.answers.push({ id: generateTestId() });
        const response = await app.post('surveyResponse', { body: [surveyResponseObject] });
        expect(response.statusCode).to.equal(400);
      });

      it('returns an error when fields are empty in the answer', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        surveyResponseObject.answers.push(generateDummyAnswer());
        surveyResponseObject.answers[0].type = '';

        const response = await app.post('surveyResponse', { body: [surveyResponseObject] });
        expect(response.statusCode).to.equal(400);
      });

      it('returns an error when ids in a survey response are in the wrong format', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        surveyResponseObject.answers.push(generateDummyAnswer());
        surveyResponseObject.entity_id = 'wrongFormatId';

        const response = await app.post('surveyResponse', { body: [surveyResponseObject] });
        expect(response.statusCode).to.equal(400);
      });

      it('returns an error when ids in an answer are in the wrong format', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        surveyResponseObject.answers.push(generateDummyAnswer());
        surveyResponseObject.answers[0].question_id = 'wrongFormatId';

        const response = await app.post('surveyResponse', { body: [surveyResponseObject] });
        expect(response.statusCode).to.equal(400);
      });

      it('returns an error when dates are in the wrong format', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        surveyResponseObject.answers.push(generateDummyAnswer());
        surveyResponseObject.start_time = 'Wrong format for date';

        const response = await app.post('surveyResponse', { body: [surveyResponseObject] });
        expect(response.statusCode).to.equal(400);
      });

      it('returns an error when question_id is empty', async () => {
        const answerObject = generateDummyAnswer();
        const questionCode = 'TEST_QUESTION_1';
        delete answerObject.question_id;
        answerObject.question_code = questionCode;
        const surveyResponseObject = generateDummySurveyResponse([answerObject]);
        const response = await app.post('changes', { body: [surveyResponseObject] });

        expect(response.statusCode).to.equal(400);
      });

      it('returns an error when survey_id is empty', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        const surveyCode = 'TEST_SURVEY';
        delete surveyResponseObject.survey_id;
        surveyResponseObject.survey_code = surveyCode;
        surveyResponseObject.answers.push(generateDummyAnswer());

        const response = await app.post('surveyResponse', { body: [surveyResponseObject] });

        expect(response.statusCode).to.equal(400);
      });
    });

    describe('Translating survey responses', () => {
      it('correctly translates user_email to user_id and assessor_name', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        const existingUserId = surveyResponseObject.user_id;
        delete surveyResponseObject.user_id;
        delete surveyResponseObject.assessor_name;
        const user = await models.user.findById(existingUserId);
        surveyResponseObject.user_email = user.email;
        surveyResponseObject.answers.push(generateDummyAnswer());

        const response = await app.post('surveyResponse', { body: [surveyResponseObject] });
        const newSurveyResponse = await models.surveyResponse.findById(surveyResponseObject.id);
        expect(response.statusCode).to.equal(200);
        expect(newSurveyResponse.user_id).to.equal(user.id);
        expect(newSurveyResponse.assessor_name).to.equal(user.fullName);
      });
    });

    describe('Survey responses with 0 answers', () => {
      it('correctly adds survey responses with no answers', async () => {
        const previousNumberOfSurveyResponses = await models.surveyResponse.count();
        const previousNumberOfAnswers = await models.answer.count();
        const surveyResponseObject = generateDummySurveyResponse();

        const response = await app.post('surveyResponse', { body: [surveyResponseObject] });
        const numberOfSurveyResponsesAdded =
          (await models.surveyResponse.count()) - previousNumberOfSurveyResponses;
        const numberOfAnswersAdded = (await models.answer.count()) - previousNumberOfAnswers;
        expect(response.statusCode).to.equal(200);
        expect(numberOfSurveyResponsesAdded).to.equal(1);
        expect(numberOfAnswersAdded).to.equal(0);
      });
    });

    describe('Survey responses containing images', () => {
      const imageResponseObject = { id: generateId(), data: TEST_IMAGE_DATA };
      const IMAGE_URL = `${BUCKET_URL}/${S3_BUCKET_NAME}/${getS3ImageFilePath()}${
        imageResponseObject.id
      }.png`;

      it('correctly adds survey responses containing imageURL', async () => {
        const previousNumberOfSurveyResponses = await models.surveyResponse.count();
        const previousNumberOfAnswers = await models.answer.count();
        const imageAnswerObject = generateDummyAnswer();
        imageAnswerObject.type = 'Photo';
        imageAnswerObject.body = imageResponseObject.id;
        const surveyResponseObject = generateDummySurveyResponse();
        surveyResponseObject.answers.push(imageAnswerObject);

        const surveyPostResponse = await app.post('surveyResponse', {
          body: [surveyResponseObject],
        });
        const numberOfSurveyResponsesAdded =
          (await models.surveyResponse.count()) - previousNumberOfSurveyResponses;
        const numberOfAnswersAdded = (await models.answer.count()) - previousNumberOfAnswers;
        expect(surveyPostResponse.statusCode).to.equal(200);
        expect(numberOfSurveyResponsesAdded).to.equal(1);
        expect(numberOfAnswersAdded).to.equal(1);
        const answer = await models.answer.findById(imageAnswerObject.id);
        expect(answer.text).to.equal(IMAGE_URL);
      });

      it('correctly adds survey responses containing image base64 String', async () => {
        const previousNumberOfSurveyResponses = await models.surveyResponse.count();
        const previousNumberOfAnswers = await models.answer.count();
        const imageAnswerObject = generateDummyAnswer();
        imageAnswerObject.type = 'Photo';
        imageAnswerObject.body = TEST_IMAGE_DATA;
        const surveyResponseObject = generateDummySurveyResponse();
        surveyResponseObject.answers.push(imageAnswerObject);

        const surveyPostResponse = await app.post('surveyResponse', {
          body: [surveyResponseObject],
        });
        const numberOfSurveyResponsesAdded =
          (await models.surveyResponse.count()) - previousNumberOfSurveyResponses;
        const numberOfAnswersAdded = (await models.answer.count()) - previousNumberOfAnswers;
        expect(surveyPostResponse.statusCode).to.equal(200);
        expect(numberOfSurveyResponsesAdded).to.equal(1);
        expect(numberOfAnswersAdded).to.equal(1);
        const answer = await models.answer.findById(imageAnswerObject.id);
        expect(answer.text).to.exist;
        const imageResponse = await fetchWithTimeout(answer.text);
        const imageBuffer = await imageResponse.buffer();
        const imageString = imageBuffer.toString('base64');
        expect(imageString).to.equal(TEST_IMAGE_DATA);
      });
    });

    describe('Survey responses creating entities', () => {
      it('adds created entities to the database', async () => {
        const entitiesCreated = new Array(5).fill(0).map(() => generateDummyEntityDetails());
        const surveyResponseObject = generateDummySurveyResponse(
          {},
          {
            entities_created: entitiesCreated,
          },
        );

        const syncResponse = await app.post('surveyResponse', { body: [surveyResponseObject] });
        expect(syncResponse.statusCode).to.equal(200);

        const entities = await models.entity.find({ id: entitiesCreated.map(e => e.id) });
        expect(entities.length).to.equal(entitiesCreated.length);
      });

      it('can use a created entity as the primary entity of the same response', async () => {
        const entitiesCreated = new Array(5).fill(0).map(() => generateDummyEntityDetails());
        const primaryEntityId = entitiesCreated[0].id;
        const surveyResponseObject = generateDummySurveyResponse(
          {},
          {
            entities_created: entitiesCreated,
            entity_id: primaryEntityId,
          },
        );

        const syncResponse = await app.post('surveyResponse', { body: [surveyResponseObject] });
        expect(syncResponse.statusCode).to.equal(200);

        const surveyResponse = await models.surveyResponse.findById(surveyResponseObject.id);
        expect(surveyResponse.entity_id).to.equal(primaryEntityId);
      });

      it('can use a created entity as the primary entity of a different response in the same batch', async () => {
        const entitiesCreated = new Array(5).fill(0).map(() => generateDummyEntityDetails());
        const primaryEntityId = entitiesCreated[0].id;
        const surveyResponseObjectOne = generateDummySurveyResponse(
          {},
          {
            entities_created: entitiesCreated,
          },
        );
        const surveyResponseObjectTwo = generateDummySurveyResponse(
          {},
          {
            entity_id: primaryEntityId,
          },
        );

        const syncResponse = await app.post('surveyResponse', {
          body: [surveyResponseObjectOne, surveyResponseObjectTwo],
        });
        expect(syncResponse.statusCode).to.equal(200);

        const surveyResponseOne = await models.surveyResponse.findById(surveyResponseObjectOne.id);
        expect(surveyResponseOne.entity_id).to.equal(entityId);

        const surveyResponseTwo = await models.surveyResponse.findById(surveyResponseObjectTwo.id);
        expect(surveyResponseTwo.entity_id).to.equal(primaryEntityId);
      });
    });

    describe('Backwards compatibility for time fields', async () => {
      it('data_time should override all others', async () => {
        const surveyResponseObject = generateDummySurveyResponse({
          data_time: new Date().toISOString(),
          submission_time: new Date().toISOString(),
        });

        const response = await app.post('surveyResponse', {
          body: [surveyResponseObject],
        });

        expect(response).to.have.property('statusCode', 200);
        const surveyResponse = await models.surveyResponse.findOne({ id: surveyResponseObject.id });
        const expectedDate = formatDateAsPSQLString(new Date(surveyResponseObject.data_time));

        expect(surveyResponse.data_time).to.equal(expectedDate);
      });

      it('Use submission_time if data_time is missing', async () => {
        const surveyResponseObject = generateDummySurveyResponse({
          submission_time: new Date().toISOString(),
        });

        const response = await app.post('surveyResponse', {
          body: [surveyResponseObject],
        });

        expect(response).to.have.property('statusCode', 200);
        const surveyResponse = await models.surveyResponse.findOne({ id: surveyResponseObject.id });
        expect(surveyResponse.data_time).to.equal(
          formatDateAsPSQLString(surveyResponseObject.submission_time),
        );
      });

      it('Use end_time if data_time and submission_time are missing', async () => {
        const surveyResponseObject = generateDummySurveyResponse();

        const response = await app.post('surveyResponse', {
          body: [surveyResponseObject],
        });

        expect(response).to.have.property('statusCode', 200);
        const surveyResponse = await models.surveyResponse.findOne({ id: surveyResponseObject.id });
        expect(surveyResponse.data_time).to.equal(
          formatDateAsPSQLString(surveyResponseObject.end_time),
        );
      });

      it('Auto fill in assessor_name when it is empty in the survey responses', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        surveyResponseObject.answers.push(generateDummyAnswer());

        surveyResponseObject.assessor_name = '';
        const response = await app.post('surveyResponse', { body: [surveyResponseObject] });
        expect(response.statusCode).to.equal(200);
      });

      it('Auto fill in start_time when it is empty in the survey responses', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        delete surveyResponseObject.start_time;
        const response = await app.post('surveyResponse', { body: [surveyResponseObject] });
        const surveyResponse = await models.surveyResponse.findOne({ id: surveyResponseObject.id });
        expect(response.statusCode).to.equal(200);
        expect(surveyResponse.start_time).to.exist;
      });

      it('Auto fill in end_time when it is empty in the survey responses', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        delete surveyResponseObject.end_time;
        const response = await app.post('surveyResponse', { body: [surveyResponseObject] });
        const surveyResponse = await models.surveyResponse.findOne({ id: surveyResponseObject.id });
        expect(response.statusCode).to.equal(200);
        expect(surveyResponse.end_time).to.exist;
      });

      it('Error if wrong format of start_time', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        surveyResponseObject.start_time = '123';
        const response = await app.post('surveyResponse', { body: [surveyResponseObject] });
        expect(response.statusCode).to.equal(400);
      });

      it('Error if wrong format of end_time', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        surveyResponseObject.end_time = '123';
        const response = await app.post('surveyResponse', { body: [surveyResponseObject] });
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('Unsupported change actions', function () {
    it('returns an error for unsupported change actions', async function () {
      const response = await app.post('surveyResponse', { body: [{ some: 'data' }] });
      expect(response.statusCode).to.equal(400);
    });
  });
});
