/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { constructAccessToken } from '@tupaia/auth';
import {
  clearTestData,
  getTestDatabase,
  getTestModels,
  generateId,
  generateTestId,
  generateValueOfType,
  buildAndInsertSurveys,
  findOrCreateDummyCountryEntity,
} from '@tupaia/database';
import { TestableServer } from '@tupaia/server-boilerplate';
import {
  createBearerHeader,
  S3_BUCKET_NAME,
  getS3ImageFilePath,
  fetchWithTimeout,
} from '@tupaia/utils';
import { TestModelRegistry } from '../../types';
import { setupDummySyncQueue, setupTestApp, setupTestUser, CentralApiMock } from '../../utilities';
import { CAT_USER_SESSION } from '../fixtures';
import { TEST_IMAGE_DATA } from './testImageData';
import {
  upsertQuestion,
  upsertEntity,
  upsertPermissionGroup,
  upsertUserEntityPermission,
  insertEntityAndFacility,
} from '../../utilities/database';
import { upsertSurveyResponsesMock } from '../../utilities/CentralApiMock';

const clinicId = generateTestId();
const entityId = generateTestId();
const surveyId = generateTestId();
const getQuestionId = (questionNumber = 0) => {
  const id = `4705c02a7_question_${questionNumber}_test`;
  return id.substring(id.length - 24); // Cut off excess for questions > 9
};
const defaultTimezone = 'Pacific/Auckland';
let userId = ''; // will be determined in 'before' phase

const generateDummyAnswer = (questionNumber?: number) => ({
  id: generateTestId(),
  type: generateValueOfType('text'),
  body: generateValueOfType('text'),
  question_id: getQuestionId(questionNumber),
});

type Answer = Record<string, unknown>;
type SurveyResponse = Record<string, unknown>;

const generateDummySurveyResponse = (answers: Answer[] = [], extraFields = {}) => ({
  id: generateTestId(),
  assessor_name: generateValueOfType('text'),
  start_time: generateValueOfType('date'),
  end_time: generateValueOfType('date'),
  entity_id: entityId,
  survey_id: surveyId,
  user_id: userId,
  entities_created: [],
  timezone: defaultTimezone,
  answers,
  ...extraFields,
});

const generateDummySurveyResponseAgainstFacility = () => {
  const surveyResponse: SurveyResponse = generateDummySurveyResponse();
  delete surveyResponse.entity_id;
  surveyResponse.clinic_id = clinicId;

  return surveyResponse;
};

const BUCKET_URL = 'https://s3-ap-southeast-2.amazonaws.com';

describe('changes (POST)', () => {
  let app: TestableServer;
  let authHeader: string;
  const models = getTestModels() as TestModelRegistry;
  const syncQueue = setupDummySyncQueue(models);
  const centralApiMock = new CentralApiMock();

  beforeAll(async () => {
    app = await setupTestApp({ central: centralApiMock });

    const user = await setupTestUser();
    userId = user.id;
    authHeader = createBearerHeader(
      constructAccessToken({
        userId,
        refreshToken: CAT_USER_SESSION.refresh_token,
        apiClientUserId: undefined,
      }),
    );
  });

  afterAll(async () => {
    await clearTestData(getTestDatabase());
  });

  describe('SubmitSurveyResponse', () => {
    beforeAll(async () => {
      const user = await setupTestUser();
      const { entity } = await findOrCreateDummyCountryEntity(models, {
        code: 'DL',
        name: 'Demo Land',
      });
      const permissionGroup = await upsertPermissionGroup(models, {
        name: 'TEST_PERMISSION_GROUP',
      });
      await upsertUserEntityPermission(models, {
        user_id: user.id,
        entity_id: entity.id,
        permission_group_id: permissionGroup.id,
      });
      for (let i = 0; i < 20; i++) {
        await upsertQuestion(models, { id: getQuestionId(i), code: `TEST_QUESTION_${i}` });
      }
      await buildAndInsertSurveys(models, [
        { id: surveyId, code: 'TEST_SURVEY', permission_group_id: permissionGroup.id },
      ]);
      await upsertEntity(models, { id: entityId, code: 'TEST_ENTITY' });
    });

    // these two failed
    describe('Translating survey responses', () => {
      it('correctly translates entity_code to entity_id', async () => {
        const answerObject = generateDummyAnswer();
        const surveyResponseObject: SurveyResponse = generateDummySurveyResponse([answerObject]);
        const entityCode = 'TEST_ENTITY';
        const surveyResponseEntityId = surveyResponseObject.entity_id;
        delete surveyResponseObject.entity_id;
        surveyResponseObject.entity_code = entityCode;
        const action = {
          action: 'SubmitSurveyResponse',
          payload: surveyResponseObject,
        };
        const response = await app.post('changes', {
          headers: {
            Authorization: authHeader,
          },
          body: [action],
        });

        expect(response.statusCode).toBe(200);
        expect(upsertSurveyResponsesMock).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ entity_id: surveyResponseEntityId })]),
        );
      });

      it('correctly translates question_code to question_id', async () => {
        const answerObject: Answer = generateDummyAnswer();
        const questionCode = 'TEST_QUESTION_1';
        delete answerObject.question_id;
        answerObject.question_code = questionCode;
        const surveyResponseObject = generateDummySurveyResponse([answerObject]);

        const action = {
          action: 'SubmitSurveyResponse',
          payload: surveyResponseObject,
        };
        const response = await app.post('changes', {
          headers: {
            Authorization: authHeader,
          },
          body: [action],
        });

        const question = await models.question.findOne({ code: questionCode });
        expect(response.statusCode).toEqual(200);
        expect(upsertSurveyResponsesMock).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              answers: expect.arrayContaining([
                expect.objectContaining({ question_id: question.id }),
              ]),
            }),
          ]),
        );
      });
    });

    describe('Survey responses containing images', () => {
      const imageResponseObject = { id: generateId(), data: TEST_IMAGE_DATA };
      const IMAGE_URL = `${BUCKET_URL}/${S3_BUCKET_NAME}/${getS3ImageFilePath()}${
        imageResponseObject.id
      }.png`;

      it('correctly uploads an image', async () => {
        const imageAction = {
          action: 'AddSurveyImage',
          payload: imageResponseObject,
        };
        const imagePostResponse = await app.post('changes', {
          headers: {
            Authorization: authHeader,
          },
          body: [imageAction],
        });
        expect(imagePostResponse.statusCode).toEqual(200);

        const uploadedImage = await fetchWithTimeout(IMAGE_URL);
        const imageBuffer = await uploadedImage.buffer();
        const imageString = imageBuffer.toString('base64');
        expect(imageString).toEqual(TEST_IMAGE_DATA);
      });
    });

    describe('Backwards compatibility for clinic_id field', () => {
      beforeAll(async () => {
        await insertEntityAndFacility(models, { facility: { id: clinicId } });
        syncQueue.clear();
      });

      it('should allow submission of a survey response with a valid clinic id', async () => {
        const surveyResponseObject = generateDummySurveyResponseAgainstFacility();
        const response = await app.post('changes', {
          headers: {
            Authorization: authHeader,
          },
          body: [
            {
              action: 'SubmitSurveyResponse',
              payload: surveyResponseObject,
            },
          ],
        });

        expect(response).toHaveProperty('statusCode', 200);
      });
    });
  });
});
