import momentTimezone from 'moment-timezone';
import { constructAccessToken } from '@tupaia/auth';
import {
  clearTestData,
  getTestDatabase,
  getTestModels,
  generateId,
  generateValueOfType,
  buildAndInsertSurveys,
  findOrCreateDummyCountryEntity,
} from '@tupaia/database';
import { TestableServer } from '@tupaia/server-boilerplate';
import { createBearerHeader, stripTimezoneFromDate } from '@tupaia/utils';
import { TestModelRegistry } from '../../types';
import {
  setupDummySyncQueue,
  setupTestApp,
  setupTestUser,
  CentralApiMock,
  grantUserAccess,
  revokeAccess,
} from '../../utilities';
import { TEST_IMAGE_DATA } from './testImageData';
import {
  upsertQuestion,
  upsertEntity,
  upsertPermissionGroup,
  upsertUserEntityPermission,
  insertEntityAndFacility,
} from '../../utilities/database';
import { upsertSurveyResponsesMock } from '../../utilities/CentralApiMock';
import { RawSurveyResponseObject } from '../../../routes/sync/PushChangesRoute';

const clinicId = generateId();
const entityId = generateId();
const surveyId = generateId();
const getQuestionId = (questionNumber = 0) => {
  const id = `4705c02a7_question_${questionNumber}_test`;
  return id.substring(id.length - 24); // Cut off excess for questions > 9
};
const defaultTimezone = 'Pacific/Auckland';
let userId = ''; // will be determined in 'before' phase

const generateDummyAnswer = (questionNumber?: number) => ({
  id: generateId(),
  type: generateValueOfType('text') as string,
  body: generateValueOfType('text') as string,
  question_id: getQuestionId(questionNumber),
});

const mockS3Bucket: { images: string[]; files: string[] } = {
  images: [], // ids
  files: [], // fileNames
};

const S3ClientMock = {
  uploadImage: (_data: string, id: string) => {
    if (mockS3Bucket.images.includes(id)) {
      throw new Error(`Image ${id} already exists`);
    }
    mockS3Bucket.images = [...mockS3Bucket.images, id];
  },
  uploadFile: (fileName: string) => {
    if (mockS3Bucket.files.includes(fileName)) {
      throw new Error(`File ${fileName} already exists`);
    }
    mockS3Bucket.files = [...mockS3Bucket.files, fileName];
  },
};

jest.mock('@tupaia/server-utils', () => {
  const original = jest.requireActual('@tupaia/server-utils');
  return {
    ...original,
    S3Client: jest.fn().mockImplementation(() => {
      return S3ClientMock;
    }),
  };
});

type Answer = Record<string, unknown>;

const generateDummySurveyResponse = (extraFields = {}): RawSurveyResponseObject => {
  const answers = generateDummyAnswer();

  return {
    id: generateId(),
    start_time: new Date().toISOString(),
    end_time: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    entity_id: entityId,
    survey_id: surveyId,
    user_id: userId,
    entities_created: [],
    timezone: defaultTimezone,
    answers: [answers],
    ...extraFields,
  };
};

const generateDummySurveyResponseAgainstFacility = () => {
  const surveyResponse = generateDummySurveyResponse();
  delete surveyResponse.entity_id;
  surveyResponse.clinic_id = clinicId;

  return surveyResponse;
};

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
        apiClientUserId: undefined,
      }),
    );
    grantUserAccess(userId);
  });

  afterAll(async () => {
    revokeAccess();
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

    describe('Translating survey responses', () => {
      it('correctly translates entity_code to entity_id', async () => {
        const answerObject = generateDummyAnswer();
        const surveyResponseObject = generateDummySurveyResponse({
          answers: [answerObject],
        });
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
        const surveyResponseObject = generateDummySurveyResponse({ answers: [answerObject] });

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
      it('correctly uploads an image', async () => {
        const id = generateId();
        const imageResponseObject = { id, data: TEST_IMAGE_DATA };

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
      });
    });

    describe('Survey responses containing files', () => {
      it('correctly uploads a file', async () => {
        const uniqueFileName = `${generateId()}_file.png`;
        const fileResponseObject = { uniqueFileName, data: TEST_IMAGE_DATA };

        const fileAction = {
          action: 'AddSurveyFile',
          payload: fileResponseObject,
        };
        const filePostResponse = await app.post('changes', {
          headers: {
            Authorization: authHeader,
          },
          body: [fileAction],
        });
        expect(filePostResponse.statusCode).toEqual(200);
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

    describe('Backwards compatibility for time fields', () => {
      const submitSurveyResponse = async (surveyResponseObject: RawSurveyResponseObject) => {
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
        return response;
      };

      const stripTimezone = (date: string | undefined) => {
        return stripTimezoneFromDate(momentTimezone(date).tz(defaultTimezone).format());
      };

      it('data_time should override all others', async () => {
        const dataTime = new Date().toISOString();
        const surveyResponseObject = generateDummySurveyResponse({
          data_time: dataTime,
          submission_time: generateValueOfType('date'),
        });

        const response = await submitSurveyResponse(surveyResponseObject);
        expect(response).toHaveProperty('statusCode', 200);

        const expectedDateTime = stripTimezone(dataTime);
        expect(upsertSurveyResponsesMock).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ data_time: expectedDateTime })]),
        );
      });

      it('Use submission_time if data_time is missing', async () => {
        const submissionTime = new Date().toISOString();
        const surveyResponseObject = generateDummySurveyResponse({
          submission_time: submissionTime,
        });

        const response = await submitSurveyResponse(surveyResponseObject);
        expect(response).toHaveProperty('statusCode', 200);

        const expectedDateTime = stripTimezone(submissionTime);
        expect(upsertSurveyResponsesMock).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ data_time: expectedDateTime })]),
        );
      });

      it('Use end_time if data_time and submission_time are missing', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        const response = await submitSurveyResponse(surveyResponseObject);

        expect(response).toHaveProperty('statusCode', 200);
        const endTime = surveyResponseObject.end_time as string;
        const expectedDateTime = stripTimezone(endTime);
        expect(upsertSurveyResponsesMock).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ data_time: expectedDateTime })]),
        );
      });

      it('Error if wrong format of start_time', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        surveyResponseObject.start_time = '123';
        const response = await submitSurveyResponse(surveyResponseObject);
        expect(response.statusCode).toEqual(400);
      });

      it('Error if wrong format of end_time', async () => {
        const surveyResponseObject = generateDummySurveyResponse();
        surveyResponseObject.end_time = '123';
        const response = await submitSurveyResponse(surveyResponseObject);
        expect(response.statusCode).toEqual(400);
      });
    });

    describe('Reject if invalid', () => {
      it('rejects if entities_created provide non-exist entity type', async () => {
        const { entity } = await findOrCreateDummyCountryEntity(models, {
          code: 'DL',
          name: 'Demo Land',
        });
        const surveyResponseObject = generateDummySurveyResponse({
          entities_created: [
            {
              id: generateId(),
              code: 'NEW_ENTITY',
              parent_id: entity.id,
              name: 'NEW_ENTITY',
              type: 'WRONG_ENTITY_TYPE',
              country_code: entity.code,
            },
          ],
        });

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

        expect(response.statusCode).toBe(400);
      });
    });
  });
});
