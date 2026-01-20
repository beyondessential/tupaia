import { expect, assert } from 'chai';
import { oneSecondSleep, randomIntBetween } from '@tupaia/utils';
import {
  generateId,
  generateValueOfType,
  RECORDS,
  buildAndInsertSurveys,
  upsertDummyRecord,
  findOrCreateDummyCountryEntity,
} from '@tupaia/database';

import {
  setupDummySyncQueue,
  TEST_USER_EMAIL,
  TestableApp,
  upsertEntity,
  upsertQuestion,
} from '../testUtilities';

const entityId = generateId();
const surveyId = generateId();
const getQuestionId = (questionNumber = 0) => {
  const id = `4705c02a7_question_${questionNumber}_test`;
  return id.substring(id.length - 24); // Cut off excess for questions > 9
};
let userId = null; // will be determined in 'before' phase
let defaultTimezone = 'Pacific/Auckland';

const generateDummySurveyResponse = (extraFields = {}) => {
  return {
    id: generateId(),
    start_time: generateValueOfType('date'),
    end_time: generateValueOfType('date'),
    timestamp: generateValueOfType('date'),
    entity_id: entityId,
    survey_id: surveyId,
    user_id: userId,
    entities_upserted: [],
    timezone: defaultTimezone,
    approval_status: 'not_required',
    answers: [],
    ...extraFields,
  };
};

const generateDummyAnswer = questionNumber => ({
  id: generateId(),
  type: 'FreeText',
  body: generateValueOfType('text'),
  question_id: getQuestionId(questionNumber),
});

const generateDummyEntityDetails = () => ({
  id: generateId(),
  name: generateValueOfType('text'),
  country_code: 'DL',
  parent_id: entityId,
  code: generateValueOfType('text'),
  type: 'case',
  attributes: {},
});

const BUCKET_URL = 'https://s3-ap-southeast-2.amazonaws.com';

function expectEqualStrings(a, b, key = '?') {
  try {
    return expect(a.toString()).to.equal(b.toString(), `Failed expectEqualStrings with "${key}"`);
  } catch (e) {
    // Errors are thrown by the toString() method.
    return assert.fail(
      a,
      b,
      `${a} was not equal to ${b}, exception thrown probably because one or both are not strings. Key: "${key}"`,
    );
  }
}

const mockS3Bucket = {};

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

      const user = await models.user.findOne({ email: TEST_USER_EMAIL });
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
          const surveyResponseObject = generateDummySurveyResponse();
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
          // Other than 'answers' and 'entities_upserted', all values in the original object should match the database
          if (!['answers', 'entities_upserted', 'timestamp'].includes(key)) {
            expectEqualStrings(firstSurveyResponse[key], value, key);
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
        expect(syncQueue.count(RECORDS.SURVEY_RESPONSE), 'survey responses added').to.equal(
          numberOfSurveyResponsesToAdd,
        );
        expect(syncQueue.count(RECORDS.ANSWER), 'answers added').to.equal(
          numberOfAnswersInEachSurvey * numberOfSurveyResponsesToAdd,
        );
      });
    });

    describe('Badly formatted survey responses', () => {
      it('returns an error when fields are missing from the survey responses', async () => {
        const badlyFormattedSurveyResponse = { id: generateId() };
        const response = await app.post('surveyResponse', {
          body: [badlyFormattedSurveyResponse],
        });
        expect(response.statusCode).to.equal(400);
      });

      it('returns an error when fields are missing from the answer', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        surveyResponseObject.answers.push({ id: generateId() });
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
        delete surveyResponseObject.survey_id;
        surveyResponseObject.survey_code = 'TEST_SURVEY';
        surveyResponseObject.answers.push(generateDummyAnswer());

        const response = await app.post('surveyResponse', { body: [surveyResponseObject] });

        expect(response.statusCode).to.equal(400);
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

    // TODO: re-enable after S3Client is properly mocked after RN-982
    // describe('Survey responses containing images', () => {
    //   const imageResponseObject = { id: generateId(), data: TEST_IMAGE_DATA };
    //   const IMAGE_URL = `${BUCKET_URL}/${S3_BUCKET_NAME}/${getS3ImageFilePath()}${
    //     imageResponseObject.id
    //   }.png`;
    //
    //   it('correctly adds survey responses containing imageURL', async () => {
    //     const previousNumberOfSurveyResponses = await models.surveyResponse.count();
    //     const previousNumberOfAnswers = await models.answer.count();
    //     const imageAnswerObject = generateDummyAnswer();
    //     imageAnswerObject.type = 'Photo';
    //     imageAnswerObject.body = imageResponseObject.id;
    //     const surveyResponseObject = generateDummySurveyResponse();
    //     surveyResponseObject.answers.push(imageAnswerObject);
    //
    //     const surveyPostResponse = await app.post('surveyResponse', {
    //       body: [surveyResponseObject],
    //     });
    //     const numberOfSurveyResponsesAdded =
    //       (await models.surveyResponse.count()) - previousNumberOfSurveyResponses;
    //     const numberOfAnswersAdded = (await models.answer.count()) - previousNumberOfAnswers;
    //     expect(surveyPostResponse.statusCode).to.equal(200);
    //     expect(numberOfSurveyResponsesAdded).to.equal(1);
    //     expect(numberOfAnswersAdded).to.equal(1);
    //     const answer = await models.answer.findById(imageAnswerObject.id);
    //     expect(answer.text).to.equal(IMAGE_URL);
    //   });
    //
    //   it('correctly adds survey responses containing image base64 String', async () => {
    //     const previousNumberOfSurveyResponses = await models.surveyResponse.count();
    //     const previousNumberOfAnswers = await models.answer.count();
    //     const imageAnswerObject = generateDummyAnswer();
    //     imageAnswerObject.type = 'Photo';
    //     imageAnswerObject.body = TEST_IMAGE_DATA;
    //     const surveyResponseObject = generateDummySurveyResponse();
    //     surveyResponseObject.answers.push(imageAnswerObject);
    //
    //     const surveyPostResponse = await app.post('surveyResponse', {
    //       body: [surveyResponseObject],
    //     });
    //     const numberOfSurveyResponsesAdded =
    //       (await models.surveyResponse.count()) - previousNumberOfSurveyResponses;
    //     const numberOfAnswersAdded = (await models.answer.count()) - previousNumberOfAnswers;
    //     expect(surveyPostResponse.statusCode).to.equal(200);
    //     expect(numberOfSurveyResponsesAdded).to.equal(1);
    //     expect(numberOfAnswersAdded).to.equal(1);
    //     const answer = await models.answer.findById(imageAnswerObject.id);
    //     expect(answer.text).to.exist;
    //   });
    // });

    describe('Survey responses creating entities', () => {
      it('adds created entities to the database', async () => {
        const entitiesUpserted = new Array(5).fill(0).map(() => generateDummyEntityDetails());
        const surveyResponseObject = generateDummySurveyResponse({
          entities_upserted: entitiesUpserted,
        });

        const syncResponse = await app.post('surveyResponse', { body: [surveyResponseObject] });
        expect(syncResponse.statusCode).to.equal(200);

        const entities = await models.entity.find({ id: entitiesUpserted.map(e => e.id) });
        expect(entities.length).to.equal(entitiesUpserted.length);
      });

      it('can use a created entity as the primary entity of the same response', async () => {
        const entitiesUpserted = new Array(5).fill(0).map(() => generateDummyEntityDetails());
        const primaryEntityId = entitiesUpserted[0].id;
        const surveyResponseObject = generateDummySurveyResponse({
          entities_upserted: entitiesUpserted,
          entity_id: primaryEntityId,
        });

        const syncResponse = await app.post('surveyResponse', { body: [surveyResponseObject] });
        expect(syncResponse.statusCode).to.equal(200);

        const surveyResponse = await models.surveyResponse.findById(surveyResponseObject.id);
        expect(surveyResponse.entity_id).to.equal(primaryEntityId);
      });

      it('can use a created entity as the primary entity of a different response in the same batch', async () => {
        const entitiesUpserted = new Array(5).fill(0).map(() => generateDummyEntityDetails());
        const primaryEntityId = entitiesUpserted[0].id;
        const surveyResponseObjectOne = generateDummySurveyResponse({
          entities_upserted: entitiesUpserted,
        });
        const surveyResponseObjectTwo = generateDummySurveyResponse({
          entity_id: primaryEntityId,
        });

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
