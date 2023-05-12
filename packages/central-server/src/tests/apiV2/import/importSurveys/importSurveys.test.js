/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import {
  buildAndInsertSurvey,
  findOrCreateDummyRecord,
  findOrCreateDummyCountryEntity,
} from '@tupaia/database';
import {
  resetTestData,
  upsertQuestion,
  TestableApp,
  expectResponseError,
} from '../../../testUtilities';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../../permissions';
import { expectPermissionError } from '../../../testUtilities/expectResponseError';

const DEFAULT_POLICY = {
  DL: ['Public'],
  KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin', 'Public'],
  SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
  VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
  LA: ['Admin'],
};

const BES_ADMIN_POLICY = {
  LA: [BES_ADMIN_PERMISSION_GROUP],
};

const TEST_DATA_FOLDER = 'src/tests/testData';

const EXISTING_TEST_SURVEY_CODE_1 = 'existing_survey_import_1_test';

const BASIC_SURVEY_CREATE_PAYLOAD = {
  can_repeat: false,
  requires_approval: false,
  service_type: 'tupaia',
  'data_group.config': {},
};

describe('importSurveys(): POST import/surveys', () => {
  const app = new TestableApp();
  const { models } = app;

  let vanuatuCountry;
  let kiribatiCountry;

  let adminPermissionGroup;

  let survey1_id;

  before(async () => {
    await resetTestData();
    adminPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Admin',
    });

    ({ country: kiribatiCountry } = await findOrCreateDummyCountryEntity(models, {
      code: 'KI',
      name: 'Kiribati',
    }));

    ({ country: vanuatuCountry } = await findOrCreateDummyCountryEntity(models, {
      code: 'VU',
      name: 'Vanuatu',
    }));

    const addQuestion = (id, type) =>
      upsertQuestion(
        models.question,
        {
          code: id,
        },
        {
          id,
          text: `Test question ${id}`,
          name: `Test question ${id}`,
          type,
        },
      );

    // Questions used for all the surveys
    await addQuestion('fdfuu42a22321c123a8_test', 'FreeText');
    await addQuestion('fdfzz42a66321c123a8_test', 'FreeText');

    const { survey: s1 } = await buildAndInsertSurvey(models, {
      code: EXISTING_TEST_SURVEY_CODE_1,
      name: EXISTING_TEST_SURVEY_CODE_1,
      permission_group_id: adminPermissionGroup.id,
      country_ids: [vanuatuCountry.id],
      dataGroup: {
        service_type: 'tupaia',
      },
    });
    survey1_id = s1.id;
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('Test permissions when importing surveys', async () => {
    describe('Edit existing surveys', async () => {
      it('Sufficient permissions - Should pass permissions check if user has the survey permission group access to all of the survey countries', async () => {
        await app.grantAccess(DEFAULT_POLICY);

        const response = await app.multipartPut({
          endpoint: `survey/${survey1_id}`,
          payload: {
            name: 'Any change will do 1',
          },
        });

        const { statusCode } = response;

        expect(statusCode).to.equal(200);
      });

      it('Sufficient permissions - Should pass permissions check if new countries are specified and user has the survey permission group access to the new countries', async () => {
        await app.grantAccess(DEFAULT_POLICY);

        const response = await app.multipartPut({
          endpoint: `survey/${survey1_id}`,
          payload: {
            name: 'Any change will do 2',
            country_ids: [kiribatiCountry.id],
          },
        });

        // Revert the countryIds back to Vanuatu for other test cases
        await models.survey.update(
          { code: EXISTING_TEST_SURVEY_CODE_1 },
          { country_ids: [vanuatuCountry.id] },
        );

        const { statusCode } = response;

        expect(statusCode).to.equal(200);
      });

      it('Sufficient permissions - Should pass permissions check if users have BES Admin access to any countries', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);

        const response = await app.multipartPut({
          endpoint: `survey/${survey1_id}`,
          payload: {
            name: 'Any change will do 3',
          },
        });

        const { statusCode } = response;

        expect(statusCode).to.equal(200);
      });

      it('Sufficient permissions - Should pass permissions check if users have both [survey permission group] - [Tupaia Admin Panel] access to all of the survey countries', async () => {
        await app.grantAccess(DEFAULT_POLICY);

        const response = await app.multipartPut({
          endpoint: `survey/${survey1_id}`,
          payload: {
            name: 'Any change will do 4',
          },
        });

        const { statusCode } = response;

        expect(statusCode).to.equal(200);
      });

      it('Insufficient permissions - Should not pass permissions check if users do not have the survey permission group access to all of the survey countries', async () => {
        const policy = {
          DL: ['Public'],
          KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin', 'Public'],
          SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
          VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /* 'Admin' */], // No Admin access to Vanuatu => throw permission error
          LA: ['Admin'],
        };

        await app.grantAccess(policy);

        const response = await app.multipartPut({
          endpoint: `survey/${survey1_id}`,
          payload: {
            name: 'Any change will do 5',
          },
        });

        expectPermissionError(response, /Need Admin access to Vanuatu/);
      });

      it('Insufficient permissions - Should not pass permissions check if new countries are specified and users do not have the Tupaia Admin Panel access to the new countries', async () => {
        const policy = {
          DL: ['Public'],
          KI: [/* TUPAIA_ADMIN_PANEL_PERMISSION_GROUP */ 'Admin', 'Public'], // No Tupaia Admin Panel access to newCountry Kiribati => throw permission error
          SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
          VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
          LA: ['Admin'],
        };

        await app.grantAccess(policy);

        const response = await app.multipartPut({
          endpoint: `survey/${survey1_id}`,
          payload: {
            name: 'Any change will do 6',
            country_ids: [kiribatiCountry.id],
          },
        });

        expectPermissionError(response, /Need Tupaia Admin Panel access to Kiribati/);
      });

      it('Insufficient permissions - Should not pass permissions check if new countries are specified and users do not have the survey permission group access to the new countries', async () => {
        const policy = {
          DL: ['Public'],
          KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin', 'Public'],
          SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
          VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /* 'Admin' */], // No Admin access to Vanuatu => throw permission error
          LA: ['Admin'],
        };

        await app.grantAccess(policy);

        const response = await app.multipartPut({
          endpoint: `survey/${survey1_id}`,
          payload: {
            name: 'Any change will do 7',
          },
        });

        expectPermissionError(response, /Need Admin access to Vanuatu/);
      });
    });

    describe('Import new surveys', async () => {
      it('Sufficient permissions - Should pass permissions user have Tupaia Admin Panel access to the specified countries of the new survey', async () => {
        await app.grantAccess(DEFAULT_POLICY);

        const response = await app.multipartPost({
          endpoint: `surveys`,
          payload: {
            ...BASIC_SURVEY_CREATE_PAYLOAD,
            name: 'NEW_TEST_SURVEY_1', // must be unique
            code: 'NEW_TEST_SURVEY_1', // must be unique
            country_ids: [kiribatiCountry.id],
            permission_group_id: adminPermissionGroup.id,
          },
        });

        const { statusCode } = response;

        expect(statusCode).to.equal(200);
      });

      it('Sufficient permissions - Should pass permissions check if user has BES Admin access to any countries', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);

        const response = await app.multipartPost({
          endpoint: `surveys`,
          payload: {
            ...BASIC_SURVEY_CREATE_PAYLOAD,
            name: 'NEW_TEST_SURVEY_2', // must be unique
            code: 'NEW_TEST_SURVEY_2', // must be unique
            country_ids: [kiribatiCountry.id],
            permission_group_id: adminPermissionGroup.id,
          },
        });

        const { statusCode } = response;

        expect(statusCode).to.equal(200);
      });

      it('Insufficient permissions - Should not pass permissions check if users do not have BES Admin or Tupaia Admin Panel access to the specified countries', async () => {
        const policy = {
          DL: ['Public'],
          KI: [/* TUPAIA_ADMIN_PANEL_PERMISSION_GROUP */ 'Admin', 'Public'], // No Tupaia Admin Panel access to newCountry Kiribati => throw permission error
          SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
          VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
          LA: ['Admin'],
        };

        await app.grantAccess(policy);

        const response = await app.multipartPost({
          endpoint: `surveys`,
          payload: {
            ...BASIC_SURVEY_CREATE_PAYLOAD,
            name: 'NEW_TEST_SURVEY_3', // must be unique
            code: 'NEW_TEST_SURVEY_3', // must be unique
            country_ids: [kiribatiCountry.id],
            permission_group_id: adminPermissionGroup.id,
          },
        });

        expectResponseError(response, /Need Tupaia Admin Panel access to Kiribati/, 500);
      });
    });
  });

  describe('Functionality', () => {
    it('Imports questions', async () => {
      await app.grantAccess(DEFAULT_POLICY);

      const response = await app.multipartPost({
        endpoint: `surveys`,
        payload: {
          ...BASIC_SURVEY_CREATE_PAYLOAD,
          name: 'NEW_TEST_SURVEY_4', // must be unique
          code: 'NEW_TEST_SURVEY_4', // must be unique
          country_ids: [kiribatiCountry.id],
          permission_group_id: adminPermissionGroup.id,
        },
        filesByMultipartKey: {
          surveyQuestions: `${TEST_DATA_FOLDER}/surveys/new_survey_import_1_test.xlsx`,
        },
      });
      const { statusCode } = response;

      expect(statusCode).to.equal(200);

      const survey = await models.survey.findOne({ code: 'NEW_TEST_SURVEY_4' });
      const surveyScreenComponents = await survey.surveyScreenComponents();
      expect(surveyScreenComponents.length).to.equal(2);
    });

    it('Updates survey properties', async () => {
      await app.grantAccess(DEFAULT_POLICY);

      const response = await app.multipartPut({
        endpoint: `survey/${survey1_id}`,
        payload: {
          name: 'Any change will do 1',
          period_granularity: 'weekly',
        },
      });

      const { statusCode } = response;

      expect(statusCode).to.equal(200);

      const survey = await models.survey.findById(survey1_id);
      expect(survey.period_granularity).to.equal('weekly');
    });
  });
});
