/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';
import { Authenticator } from '@tupaia/auth';
import { buildAndInsertSurveys, findOrCreateDummyRecord } from '@tupaia/database';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../permissions';
import { upsertEntity } from '../../testUtilities';
import { TestableApp } from '../../TestableApp';
import { expectPermissionError } from '../../testUtilities/expectResponseError';

const DEFAULT_POLICY = {
  DL: ['Admin'],
  KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
  SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
  VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
  TO: ['Admin'],
  LA: ['Admin'],
};

const TEST_DATA_FOLDER = 'src/tests/testData';

const prepareStubAndAuthenticate = async (app, policy = DEFAULT_POLICY) => {
  sinon.stub(Authenticator.prototype, 'getAccessPolicyForUser').returns(policy);
  await app.authenticate();
};

describe('importSurveyResponses(): POST import/surveyResponses', () => {
  const app = new TestableApp();
  const models = app.models;

  describe('Test permissions when importing surveyResponses', async () => {
    const importFile = filename =>
      app
        .post('import/surveyResponses')
        .attach('surveyResponses', `${TEST_DATA_FOLDER}/surveyResponses/${filename}`);

    before(async () => {
      const adminPermissionGroup = await models.permissionGroup.findOne({ name: 'Admin' });
      const demoLand = await models.country.findOne({ code: 'DL' });

      await buildAndInsertSurveys(models, [
        {
          id: 'TEST_IMPORT_SURVEY_RESPONSES_1_test',
          code: 'TEST_IMPORT_SURVEY_RESPONSES_1_test',
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
          ],
        },
        {
          id: 'TEST_IMPORT_SURVEY_RESPONSES_2_test',
          code: 'TEST_IMPORT_SURVEY_RESPONSES_2_test',
          permission_group_id: adminPermissionGroup.id,
          country_ids: [demoLand.id],
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

      const entity = await models.entity.findOne({ code: 'DL_7' });
      await upsertEntity({ code: 'KI_111_test', country_code: 'KI' });
      await upsertEntity({ code: 'KI_222_test', country_code: 'KI' });
      await upsertEntity({ code: 'KI_333_test', country_code: 'KI' });
      await upsertEntity({ code: 'KI_444_test', country_code: 'KI' });

      const userId = 'user_00000000000000_test';
      await models.user.updateOrCreate(
        {
          id: userId,
        },
        {
          name: 'Test User',
          email: 'testuser@tupaia.org',
          password_hash: 'hash',
          password_salt: 'salt',
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
            submission_date: new Date(),
          },
        );

      await createSurveyResponse('fdfcc42a44705c123a8_test', 'TEST_IMPORT_SURVEY_RESPONSES_1_test');
      await createSurveyResponse('fdfcc42a44705c123e2_test', 'TEST_IMPORT_SURVEY_RESPONSES_2_test');
    });

    afterEach(() => {
      Authenticator.prototype.getAccessPolicyForUser.restore();
    });

    it('Sufficient permissions: Should pass permissions check when importing survey responses from 1 survey', async () => {
      await prepareStubAndAuthenticate(app);
      const response = await importFile('importResponsesFromSingleSurvey.xlsx');
      const { statusCode } = response;

      expect(statusCode).to.equal(200);
    });

    it('Sufficient permissions: Should pass permissions check when importing survey responses from multiple surveys', async () => {
      await prepareStubAndAuthenticate(app);
      const response = await importFile('importResponsesFromMultipleSurveys.xlsx');
      const { statusCode } = response;

      expect(statusCode).to.equal(200);
    });

    it('Insufficient permissions: Should not pass permissions check when importing survey responses from 1 survey and users do not have access to the survey', async () => {
      const policy = {
        DL: ['Public'], //Public instead of Admin =>  throw error for all the survey responses of DL
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        TO: ['Admin'],
        LA: ['Admin'],
      };
      await prepareStubAndAuthenticate(app, policy);
      const response = await importFile('importResponsesFromSingleSurvey.xlsx');

      expectPermissionError(
        response,
        /Need Admin access to Demo Land to import the survey responses/,
      );
    });

    it('Insufficient permissions: Should not pass permissions check when importing survey responses from multiple surveys and users do not have access to any of the surveys', async () => {
      const policy = {
        DL: ['Admin'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /*'Admin'*/], //No Admin access to KI => throw error for all the survey responses of Kiribati
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        TO: ['Admin'],
        LA: ['Admin'],
      };
      await prepareStubAndAuthenticate(app, policy);
      const response = await importFile('importResponsesFromMultipleSurveys.xlsx');

      expectPermissionError(
        response,
        /Need Admin access to Demo Land,Kiribati to import the survey responses/,
      );
    });
  });
});
