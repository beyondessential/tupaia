/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { expect, assert } from 'chai';
import { fetchWithTimeout, oneSecondSleep } from '@tupaia/utils';
import {
  generateId,
  generateTestId,
  generateValueOfType,
  TYPES,
  buildAndInsertSurveys,
} from '@tupaia/database';

import { TEST_IMAGE_DATA } from '../../testData';
import {
  insertEntityAndFacility,
  randomIntBetween,
  upsertEntity,
  upsertQuestion,
} from '../../testUtilities';
import { getImageFilePath, BUCKET_NAME } from '../../../s3/constants';

const clinicId = generateTestId();
const entityId = generateTestId();
const surveyId = generateTestId();
const getQuestionId = (questionNumber = 0) => {
  const id = `4705c02a7_question_${questionNumber}_test`;
  return id.substring(id.length - 24); // Cut off excess for questions > 9
};
let userId = null; // will be determined in 'before' phase

const generateDummySurveyResponse = () => ({
  id: generateTestId(),
  assessor_name: generateValueOfType('text'),
  start_time: generateValueOfType('date'),
  end_time: generateValueOfType('date'),
  answers: [],
  entity_id: entityId,
  survey_id: surveyId,
  user_id: userId,
  entities_created: [],
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

const BUCKET_URL = 'https://s3-ap-southeast-2.amazonaws.com';

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

export const testPostChanges = (app, models, syncQueue) =>
  function () {
    describe('SubmitSurveyResponse', () => {
      before(async () => {
        for (let i = 0; i < 20; i++) {
          await upsertQuestion({ id: getQuestionId(i) });
        }

        await buildAndInsertSurveys(models, [{ id: surveyId, code: 'TEST_SURVEY' }]);
        await upsertEntity({ id: entityId });

        const user = await models.user.findOne();
        userId = user.id;
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
  };
