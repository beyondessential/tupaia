/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';
import { expect, assert } from 'chai';
import { fetchWithTimeout, oneSecondSleep, randomIntBetween } from '@tupaia/utils';
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
import {
  insertEntityAndFacility,
  setupDummySyncQueue,
  TestableApp,
  upsertEntity,
  upsertQuestion,
} from '../testUtilities';
import { getImageFilePath, BUCKET_NAME } from '../../s3/constants';

const clinicId = generateTestId();
const entityId = generateTestId();
const surveyId = generateTestId();
const getQuestionId = (questionNumber = 0) => {
  const id = `4705c02a7_question_${questionNumber}_test`;
  return id.substring(id.length - 24); // Cut off excess for questions > 9
};
const defaultTimezone = 'Pacific/Auckland';
let userId = null; // will be determined in 'before' phase

const generateDummySurveyResponse = (extraFields = {}) => ({
  id: generateTestId(),
  assessor_name: generateValueOfType('text'),
  start_time: generateValueOfType('date'),
  end_time: generateValueOfType('date'),
  answers: [],
  entity_id: entityId,
  survey_id: surveyId,
  user_id: userId,
  entities_created: [],
  timezone: defaultTimezone,
  ...extraFields,
});

const generateDummySurveyResponseAgainstFacility = () => {
  const surveyResponse = generateDummySurveyResponse();
  delete surveyResponse.entity_id;
  surveyResponse.clinic_id = clinicId;

  return surveyResponse;
};

const generateDummyAnswer = questionNumber => ({
  id: generateTestId(),
  type: generateValueOfType('text'),
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

describe('POST /changes', async () => {
  const app = new TestableApp();
  const { models } = app;
  const syncQueue = setupDummySyncQueue(models);

  describe('SubmitSurveyResponse', () => {
    before(async () => {
      await app.grantAccess({ DL: ['TEST_PERMISSION_GROUP'] });

      await findOrCreateDummyCountryEntity(models, {
        code: 'DL',
        name: 'Demo Land',
      });

      for (let i = 0; i < 20; i++) {
        await upsertQuestion({ id: getQuestionId(i), code: `TEST_QUESTION_${i}` });
      }

      const permissionGroup = await upsertDummyRecord(models.permissionGroup, {
        name: 'TEST_PERMISSION_GROUP',
      });
      await buildAndInsertSurveys(models, [
        { id: surveyId, code: 'TEST_SURVEY', permission_group_id: permissionGroup.id },
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

      const changeActions = [];

      before(async () => {
        for (let i = 0; i < numberOfSurveyResponsesToAdd; i++) {
          const surveyResponseObject = generateDummySurveyResponse();
          for (let j = 0; j < numberOfAnswersInEachSurvey; j++) {
            surveyResponseObject.answers.push(generateDummyAnswer(j));
          }
          const changeAction = {
            action: 'SubmitSurveyResponse',
            payload: surveyResponseObject,
          };
          changeActions.push(changeAction);
        }

        syncQueue.clear();
        previousNumberOfSurveyResponses = await models.surveyResponse.count();
        previousNumberOfAnswers = await models.answer.count();
        response = await app.post('changes', { body: changeActions });
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
        const firstSurveyResponseObject = changeActions[0].payload;
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
        const firstSurveyResponseObject = changeActions[0].payload;
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
        const badlyFormattedSurveyResponseAction = {
          action: 'SubmitSurveyResponse',
          payload: { id: generateTestId() },
        };
        const response = await app.post('changes', {
          body: [badlyFormattedSurveyResponseAction],
        });
        expect(response.statusCode).to.equal(400);
      });

      it('returns an error when fields are missing from the answer', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        surveyResponseObject.answers.push({ id: generateTestId() });
        const action = {
          action: 'SubmitSurveyResponse',
          payload: surveyResponseObject,
        };
        const response = await app.post('changes', { body: [action] });
        expect(response.statusCode).to.equal(400);
      });

      it('returns an error when fields are empty in the survey responses', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        surveyResponseObject.answers.push(generateDummyAnswer());
        const action = {
          action: 'SubmitSurveyResponse',
          payload: surveyResponseObject,
        };
        surveyResponseObject.assessor_name = '';
        const response = await app.post('changes', { body: [action] });
        expect(response.statusCode).to.equal(400);
      });

      it('returns an error when fields are empty in the answer', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        surveyResponseObject.answers.push(generateDummyAnswer());
        surveyResponseObject.answers[0].type = '';
        const action = {
          action: 'SubmitSurveyResponse',
          payload: surveyResponseObject,
        };
        const response = await app.post('changes', { body: [action] });
        expect(response.statusCode).to.equal(400);
      });

      it('returns an error when ids in a survey response are in the wrong format', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        surveyResponseObject.answers.push(generateDummyAnswer());
        surveyResponseObject.entity_id = 'wrongFormatId';
        const action = {
          action: 'SubmitSurveyResponse',
          payload: surveyResponseObject,
        };
        const response = await app.post('changes', { body: [action] });
        expect(response.statusCode).to.equal(400);
      });

      it('returns an error when ids in an answer are in the wrong format', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        surveyResponseObject.answers.push(generateDummyAnswer());
        surveyResponseObject.answers[0].question_id = 'wrongFormatId';
        const action = {
          action: 'SubmitSurveyResponse',
          payload: surveyResponseObject,
        };
        const response = await app.post('changes', { body: [action] });
        expect(response.statusCode).to.equal(400);
      });

      it('returns an error when dates are in the wrong format', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        surveyResponseObject.answers.push(generateDummyAnswer());
        surveyResponseObject.start_time = 'Wrong format for date';
        const action = {
          action: 'SubmitSurveyResponse',
          payload: surveyResponseObject,
        };
        const response = await app.post('changes', { body: [action] });
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
        const action = {
          action: 'SubmitSurveyResponse',
          payload: surveyResponseObject,
        };
        const response = await app.post('changes', { body: [action] });
        const newSurveyResponse = await models.surveyResponse.findById(surveyResponseObject.id);
        expect(response.statusCode).to.equal(200);
        expect(newSurveyResponse.user_id).to.equal(user.id);
        expect(newSurveyResponse.assessor_name).to.equal(user.fullName);
      });

      it('correctly translates entity_code to entity_id', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        const entityCode = 'TEST_ENTITY';
        delete surveyResponseObject.entity_id;
        surveyResponseObject.entity_code = entityCode;
        surveyResponseObject.answers.push(generateDummyAnswer());
        const action = {
          action: 'SubmitSurveyResponse',
          payload: surveyResponseObject,
        };
        const response = await app.post('changes', { body: [action] });
        const entity = await models.entity.findOne({ code: entityCode });
        const newSurveyResponse = await models.surveyResponse.findById(surveyResponseObject.id);
        expect(response.statusCode).to.equal(200);
        expect(newSurveyResponse.entity_id).to.equal(entity.id);
      });

      it('correctly translates survey_code to survey_id', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        const surveyCode = 'TEST_SURVEY';
        delete surveyResponseObject.survey_id;
        surveyResponseObject.survey_code = surveyCode;
        surveyResponseObject.answers.push(generateDummyAnswer());
        const action = {
          action: 'SubmitSurveyResponse',
          payload: surveyResponseObject,
        };
        const response = await app.post('changes', { body: [action] });
        const survey = await models.survey.findOne({ code: surveyCode });
        const newSurveyResponse = await models.surveyResponse.findById(surveyResponseObject.id);
        expect(response.statusCode).to.equal(200);
        expect(newSurveyResponse.survey_id).to.equal(survey.id);
      });

      it('correctly translates question_code to question_id', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        const answerObject = generateDummyAnswer();
        const questionCode = 'TEST_QUESTION_1';
        delete answerObject.question_id;
        answerObject.question_code = questionCode;
        surveyResponseObject.answers.push(answerObject);
        const action = {
          action: 'SubmitSurveyResponse',
          payload: surveyResponseObject,
        };
        const response = await app.post('changes', { body: [action] });
        const question = await models.question.findOne({ code: questionCode });
        const newAnswer = await models.answer.findById(answerObject.id);
        expect(response.statusCode).to.equal(200);
        expect(newAnswer.question_id).to.equal(question.id);
      });
    });

    describe('Survey responses with 0 answers', () => {
      it('correctly adds survey responses with no answers', async () => {
        const previousNumberOfSurveyResponses = await models.surveyResponse.count();
        const previousNumberOfAnswers = await models.answer.count();
        const surveyResponseObject = generateDummySurveyResponse();
        const action = {
          action: 'SubmitSurveyResponse',
          payload: surveyResponseObject,
        };
        const response = await app.post('changes', { body: [action] });
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
      const IMAGE_URL = `${BUCKET_URL}/${BUCKET_NAME}/${getImageFilePath()}${
        imageResponseObject.id
      }.png`;

      it('correctly uploads an image', async () => {
        const imageAction = {
          action: 'AddSurveyImage',
          payload: imageResponseObject,
        };
        const imagePostResponse = await app.post('changes', { body: [imageAction] });
        expect(imagePostResponse.statusCode).to.equal(200);

        const uploadedImage = await fetchWithTimeout(IMAGE_URL);
        const imageBuffer = await uploadedImage.buffer();
        const imageString = imageBuffer.toString('base64');
        expect(imageString).to.equal(TEST_IMAGE_DATA);
      });

      it('correctly adds survey responses containing imageURL', async () => {
        const previousNumberOfSurveyResponses = await models.surveyResponse.count();
        const previousNumberOfAnswers = await models.answer.count();
        const imageAnswerObject = generateDummyAnswer();
        imageAnswerObject.type = 'Photo';
        imageAnswerObject.body = imageResponseObject.id;
        const surveyResponseObject = generateDummySurveyResponse();
        surveyResponseObject.answers.push(imageAnswerObject);
        const surveyAction = {
          action: 'SubmitSurveyResponse',
          payload: surveyResponseObject,
        };

        const surveyPostResponse = await app.post('changes', { body: [surveyAction] });
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
        const surveyAction = {
          action: 'SubmitSurveyResponse',
          payload: surveyResponseObject,
        };

        const surveyPostResponse = await app.post('changes', { body: [surveyAction] });
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
        const surveyResponseObject = generateDummySurveyResponse({
          entities_created: entitiesCreated,
        });
        const syncAction = {
          action: 'SubmitSurveyResponse',
          payload: surveyResponseObject,
        };
        const syncResponse = await app.post('changes', { body: [syncAction] });
        expect(syncResponse.statusCode).to.equal(200);

        const entities = await models.entity.find({ id: entitiesCreated.map(e => e.id) });
        expect(entities.length).to.equal(entitiesCreated.length);
      });

      it('can use a created entity as the primary entity of the same response', async () => {
        const entitiesCreated = new Array(5).fill(0).map(() => generateDummyEntityDetails());
        const primaryEntityId = entitiesCreated[0].id;
        const surveyResponseObject = generateDummySurveyResponse({
          entities_created: entitiesCreated,
          entity_id: primaryEntityId,
        });
        const syncAction = {
          action: 'SubmitSurveyResponse',
          payload: surveyResponseObject,
        };
        const syncResponse = await app.post('changes', { body: [syncAction] });
        expect(syncResponse.statusCode).to.equal(200);

        const surveyResponse = await models.surveyResponse.findById(surveyResponseObject.id);
        expect(surveyResponse.entity_id).to.equal(primaryEntityId);
      });

      it('can use a created entity as the primary entity of a different response in the same batch', async () => {
        const entitiesCreated = new Array(5).fill(0).map(() => generateDummyEntityDetails());
        const primaryEntityId = entitiesCreated[0].id;
        const surveyResponseObjectOne = generateDummySurveyResponse({
          entities_created: entitiesCreated,
        });
        const syncActionOne = {
          action: 'SubmitSurveyResponse',
          payload: surveyResponseObjectOne,
        };
        const surveyResponseObjectTwo = generateDummySurveyResponse({
          entity_id: primaryEntityId,
        });
        const syncActionTwo = {
          action: 'SubmitSurveyResponse',
          payload: surveyResponseObjectTwo,
        };
        const syncResponse = await app.post('changes', { body: [syncActionOne, syncActionTwo] });
        expect(syncResponse.statusCode).to.equal(200);

        const surveyResponseOne = await models.surveyResponse.findById(surveyResponseObjectOne.id);
        expect(surveyResponseOne.entity_id).to.equal(entityId);

        const surveyResponseTwo = await models.surveyResponse.findById(surveyResponseObjectTwo.id);
        expect(surveyResponseTwo.entity_id).to.equal(primaryEntityId);
      });
    });

    describe('Backwards compatibility for clinic_id field', () => {
      before(async () => {
        await insertEntityAndFacility({ facility: { id: clinicId } });
        syncQueue.clear();
      });

      it('should allow submission of a survey response with a valid clinic id', async () => {
        const surveyResponseObject = generateDummySurveyResponseAgainstFacility();

        const response = await app.post('changes', {
          body: [
            {
              action: 'SubmitSurveyResponse',
              payload: surveyResponseObject,
            },
          ],
        });

        expect(response).to.have.property('statusCode', 200);
      });
    });

    describe('Backwards compatibility for time fields', async () => {
      it('data_time should override all others', async () => {
        const surveyResponseObject = generateDummySurveyResponse({
          data_time: generateValueOfType('date'),
          submission_time: generateValueOfType('date'),
        });

        const response = await app.post('changes', {
          body: [
            {
              action: 'SubmitSurveyResponse',
              payload: surveyResponseObject,
            },
          ],
        });

        expect(response).to.have.property('statusCode', 200);
        const surveyResponse = await models.surveyResponse.findOne({ id: surveyResponseObject.id });
        expect(surveyResponse.data_time).to.equal(
          formatDateAsPSQLString(surveyResponseObject.data_time),
        );
      });

      it('Use submission_time if data_time is missing', async () => {
        const surveyResponseObject = generateDummySurveyResponse({
          submission_time: generateValueOfType('date'),
        });

        const response = await app.post('changes', {
          body: [
            {
              action: 'SubmitSurveyResponse',
              payload: surveyResponseObject,
            },
          ],
        });

        expect(response).to.have.property('statusCode', 200);
        const surveyResponse = await models.surveyResponse.findOne({ id: surveyResponseObject.id });
        expect(surveyResponse.data_time).to.equal(
          formatDateAsPSQLString(surveyResponseObject.submission_time),
        );
      });

      it('Use end_time if data_time and submission_time are missing', async () => {
        const surveyResponseObject = generateDummySurveyResponse();

        const response = await app.post('changes', {
          body: [
            {
              action: 'SubmitSurveyResponse',
              payload: surveyResponseObject,
            },
          ],
        });

        expect(response).to.have.property('statusCode', 200);
        const surveyResponse = await models.surveyResponse.findOne({ id: surveyResponseObject.id });
        expect(surveyResponse.data_time).to.equal(
          formatDateAsPSQLString(surveyResponseObject.end_time),
        );
      });

      it('Error if no time value is given', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        delete surveyResponseObject.end_time;

        const response = await app.post('changes', {
          body: [
            {
              action: 'SubmitSurveyResponse',
              payload: surveyResponseObject,
            },
          ],
        });

        expect(response).to.have.property('statusCode', 400);
      });
    });
  });

  describe('Unsupported change actions', function () {
    it('returns an error for unsupported change actions', async function () {
      const unsupportedChangeAction = {
        action: 'UnsupportedAction',
        payload: { some: 'data' },
      };
      const response = await app.post('changes', { body: [unsupportedChangeAction] });
      expect(response.statusCode).to.equal(400);
    });
  });
});
