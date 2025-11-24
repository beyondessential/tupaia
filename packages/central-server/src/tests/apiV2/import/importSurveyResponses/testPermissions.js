import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import {
  buildAndInsertSurveys,
  findOrCreateDummyRecord,
  findOrCreateDummyCountryEntity,
} from '@tupaia/database';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../../permissions';
import { expectPermissionError, TestableApp } from '../../../testUtilities';

const DEFAULT_POLICY = {
  DL: ['Admin'],
  KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
  SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
  VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
  TO: ['Admin'],
  LA: ['Admin'],
};

const TEST_DATA_FOLDER = 'src/tests/testData';
const SURVEY_NAME_1 = 'Test Import Survey Response 1';
const SURVEY_NAME_2 = 'Test Import Survey Response 2';
const SURVEY_CODE_1 = 'TEST_IMPORT_SURVEY_RESP_1_test';
const SURVEY_CODE_2 = 'TEST_IMPORT_SURVEY_RESP_2_test';

export const testPermissions = async () => {
  const app = new TestableApp();
  const { models } = app;

  const importFile = (filename, surveyCodes) => {
    const surveyCodesParam = surveyCodes.map(s => `surveyCodes=${s}`).join('&');
    return app
      .post(`import/surveyResponses?${surveyCodesParam}&timeZone=Australia%2FMelbourne`)
      .attach('surveyResponses', `${TEST_DATA_FOLDER}/surveyResponses/${filename}`);
  };

  before(async () => {
    const adminPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Admin',
    });
    const { country: demoLand } = await findOrCreateDummyCountryEntity(models, {
      code: 'DL',
      name: 'Demo Land',
    });
    const { country: kiribatiCountry } = await findOrCreateDummyCountryEntity(models, {
      code: 'KI',
      name: 'Kiribati',
    });
    const [{ survey: survey1 }, { survey: survey2 }] = await buildAndInsertSurveys(models, [
      {
        code: SURVEY_CODE_1,
        name: SURVEY_NAME_1,
        permission_group_id: adminPermissionGroup.id,
        country_ids: [demoLand.id],
        questions: [
          {
            id: 'fdfcc42a44321c123a8_test',
            code: 'TEST_IMPORT_SURVEY_RESPONSES_1_question_1_test',
            type: 'FreeText',
            text: 'Facility status',
          },
          {
            id: 'fdfcc42a44456c123a8_test',
            code: 'TEST_IMPORT_SURVEY_RESPONSES_1_question_2_test',
            type: 'FreeText',
            text: 'Opening hours',
          },
          {
            id: 'fdfcc42a44456c123a9_test',
            code: 'TEST_IMPORT_SURVEY_RESPONSES_1_question_3_test',
            type: 'User',
            text: 'User assigned',
          },
        ],
      },
      {
        code: SURVEY_CODE_2,
        name: SURVEY_NAME_2,
        permission_group_id: adminPermissionGroup.id,
        country_ids: [kiribatiCountry.id],
        questions: [
          {
            id: 'fdfcc42a22321c123a8_test',
            code: 'TEST_IMPORT_SURVEY_RESPONSES_2_question_1_test',
            type: 'FreeText',
            text: 'Facility status',
          },
          {
            id: 'fdfcc42a66321c123a8_test',
            code: 'TEST_IMPORT_SURVEY_RESPONSES_2_question_2_test',
            type: 'FreeText',
            text: 'Opening hours',
          },
        ],
      },
    ]);

    const entity = await findOrCreateDummyRecord(models.entity, {
      code: 'DL_7',
      country_code: demoLand.code,
      name: 'Lake Charm',
    });
    await findOrCreateDummyRecord(models.entity, {
      code: 'DL_9',
      country_code: demoLand.code,
      name: 'Thornbury',
    });
    await findOrCreateDummyRecord(models.entity, {
      code: 'DL_10',
      country_code: demoLand.code,
      name: 'Traralgon',
    });
    await findOrCreateDummyRecord(models.entity, {
      code: 'DL_11',
      country_code: demoLand.code,
      name: 'National Medical Warehouse',
    });
    await findOrCreateDummyRecord(models.entity, {
      code: 'KI_111_test',
      country_code: kiribatiCountry.code,
      name: 'Test 1',
    });
    await findOrCreateDummyRecord(models.entity, {
      code: 'KI_222_test',
      country_code: kiribatiCountry.code,
      name: 'Test 2',
    });
    await findOrCreateDummyRecord(models.entity, {
      code: 'KI_333_test',
      country_code: kiribatiCountry.code,
      name: 'Test 3',
    });
    await findOrCreateDummyRecord(models.entity, {
      code: 'KI_444_test',
      country_code: kiribatiCountry.code,
      name: 'Test 4',
    });
    const userId = 'user_00000000000000_test';
    await models.user.updateOrCreate(
      {
        id: userId,
      },
      {
        name: 'Test User',
        email: 'testuser@tupaia.org',
        password_hash: 'hash',
      },
    );

    // entity that all edited responses should be against
    const createSurveyResponse = (id, surveyId) =>
      findOrCreateDummyRecord(
        models.surveyResponse,
        {
          id,
        },
        {
          survey_id: surveyId,
          user_id: userId,
          entity_id: entity.id,
          assessor_name: 'Test',
          start_time: new Date(),
          end_time: new Date(),
          date_time: new Date(),
        },
      );

    await createSurveyResponse('fdfcc42a44705c123a8_test', survey1.id);
    await createSurveyResponse('fdfcc42a44705c123e2_test', survey2.id);
  });

  afterEach(() => {
    app.revokeAccess();
  });

  it('Sufficient permissions: Should pass permissions check when importing survey responses from 1 survey', async () => {
    await app.grantAccess(DEFAULT_POLICY);
    const response = await importFile('importResponsesFromSingleSurvey.xlsx', [SURVEY_CODE_1]);
    const { statusCode } = response;

    expect(statusCode).to.equal(200);
  });

  it('Sufficient permissions: Should pass permissions check when importing survey responses from multiple surveys', async () => {
    await app.grantAccess(DEFAULT_POLICY);
    const response = await importFile('importResponsesFromMultipleSurveys.xlsx', [
      SURVEY_CODE_1,
      SURVEY_CODE_2,
    ]);
    const { statusCode } = response;

    expect(statusCode).to.equal(200);
  });

  it('Insufficient permissions: Should not pass permissions check when importing survey responses from 1 survey and users do not have access to the survey', async () => {
    const policy = {
      DL: ['Public'], // Public instead of Admin =>  throw error for all the survey responses of DL
      KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
      SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
      VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
      TO: ['Admin'],
      LA: ['Admin'],
    };
    await app.grantAccess(policy);
    const response = await importFile('importResponsesFromSingleSurvey.xlsx', [SURVEY_CODE_1]);

    expectPermissionError(
      response,
      /Need Admin access to Demo Land to import the survey response\(s\)/,
    );
  });

  it('Insufficient permissions: Should not pass permissions check when importing survey responses from multiple surveys and users do not have access to any of the surveys', async () => {
    const policy = {
      DL: ['Admin'],
      KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /* 'Admin' */], // No Admin access to KI => throw error for all the survey responses of Kiribati
      SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
      VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
      TO: ['Admin'],
      LA: ['Admin'],
    };
    await app.grantAccess(policy);
    const response = await importFile('importResponsesFromMultipleSurveys.xlsx', [
      SURVEY_CODE_1,
      SURVEY_CODE_2,
    ]);

    expectPermissionError(
      response,
      /Need Admin access to Kiribati to import the survey response\(s\)/,
    );
  });
};
