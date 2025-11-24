import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import {
  buildAndInsertSurvey,
  findOrCreateDummyRecord,
  findOrCreateDummyCountryEntity,
} from '@tupaia/database';
import path from 'path';
import {
  resetTestData,
  upsertQuestion,
  TestableApp,
  expectResponseError,
} from '../../testUtilities';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../permissions';
import { expectPermissionError } from '../../testUtilities/expectResponseError';

const DEFAULT_POLICY = {
  DL: ['Public'],
  KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin', 'Public'],
  SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
  VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
  LA: ['Admin'],
  TO: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
};

const BES_ADMIN_POLICY = {
  LA: [BES_ADMIN_PERMISSION_GROUP],
};

const TEST_DATA_FOLDER = 'src/tests/testData';

const EXISTING_TEST_SURVEY_CODE_1 = 'existing_survey_import_1_test';

const BASIC_SURVEY_CREATE_PAYLOAD = {
  can_repeat: false,
  requires_approval: false,
  'data_group.service_type': 'tupaia',
  'data_group.config': {},
};

const EXISTING_QUESTION_CODES = ['fdfuu42a22321c123a8_test', 'fdfzz42a66321c123a8_test'];

describe('Create and Edit Surveys', () => {
  const app = new TestableApp();
  const { models } = app;

  let vanuatuCountry;
  let kiribatiCountry;
  let vanuatuEntity;
  let kiribatiEntity;
  let tongaCountry;

  let adminPermissionGroup;

  let survey1_id;

  let dhis2SurveyId;

  let project1;
  let project2;

  before(async () => {
    await resetTestData();

    adminPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Admin',
    });

    ({ country: kiribatiCountry, entity: kiribatiEntity } = await findOrCreateDummyCountryEntity(
      models,
      {
        code: 'KI',
        name: 'Kiribati',
      },
    ));

    ({ country: vanuatuCountry, entity: vanuatuEntity } = await findOrCreateDummyCountryEntity(
      models,
      {
        code: 'VU',
        name: 'Vanuatu',
      },
    ));

    ({ country: tongaCountry } = await findOrCreateDummyCountryEntity(models, {
      code: 'TO',
      name: 'Tonga',
    }));

    const entityHierarchy = await findOrCreateDummyRecord(models.entityHierarchy, {
      name: 'Project 1',
    });

    const projectEntity = await findOrCreateDummyRecord(models.entity, {
      code: 'project1',
    });

    project1 = await findOrCreateDummyRecord(models.project, {
      code: 'project1',
      entity_hierarchy_id: entityHierarchy.id,
      entity_id: projectEntity.id,
    });

    project2 = await findOrCreateDummyRecord(models.project, {
      code: 'project2',
    });

    const addProjectCountryEntityRelations = async entity => {
      await findOrCreateDummyRecord(models.entityRelation, {
        parent_id: project1.entity_id,
        child_id: entity.id,
        entity_hierarchy_id: entityHierarchy.id,
      });
    };

    await Promise.all([kiribatiEntity, vanuatuEntity].map(addProjectCountryEntityRelations));

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
    await Promise.all(EXISTING_QUESTION_CODES.map(code => addQuestion(code, 'FreeText')));

    // explicitly create the data elements
    await Promise.all(
      EXISTING_QUESTION_CODES.map(code =>
        findOrCreateDummyRecord(
          models.dataElement,
          { code },
          {
            service_type: 'tupaia',
          },
        ),
      ),
    );

    const { survey: s1 } = await buildAndInsertSurvey(models, {
      code: EXISTING_TEST_SURVEY_CODE_1,
      name: EXISTING_TEST_SURVEY_CODE_1,
      permission_group_id: adminPermissionGroup.id,
      country_ids: [vanuatuCountry.id],
      project_id: project1.id,
      dataGroup: {
        service_type: 'tupaia',
      },
    });
    survey1_id = s1.id;

    // create the dhis survey
    const { survey: dhis2survey } = await buildAndInsertSurvey(models, {
      code: 'test_survey',
      name: 'test_survey',
      permission_group_id: adminPermissionGroup.id,
      country_ids: [vanuatuCountry.id],
      project_id: project1.id,
      dataGroup: {
        service_type: 'dhis',
        config: {
          dhisInstanceCode: 'test_instance',
        },
      },
    });

    dhis2SurveyId = dhis2survey.id;
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('Permissions', async () => {
    describe('Edit existing surveys', async () => {
      it('Sufficient permissions - Should pass permissions check if user has the survey permission group access to all of the survey countries', async () => {
        await app.grantAccess(DEFAULT_POLICY);

        const response = await app.multipartPut({
          endpoint: `surveys/${survey1_id}`,
          payload: {
            name: 'Any change will do 1',
          },
        });

        const { statusCode } = response;

        expect(statusCode).to.equal(200);
      });

      it('Sufficient permissions - Should pass permissions check if new countries are specified and user has the survey permission group access to the new countries and the countries are part of the project', async () => {
        await app.grantAccess(DEFAULT_POLICY);

        const response = await app.multipartPut({
          endpoint: `surveys/${survey1_id}`,
          payload: {
            name: 'Any change will do 2',
            countryNames: [kiribatiCountry.name],
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

      it('Insufficient permissions - Should throw an error if countries are changed on a survey and any of these do not belong to the project', async () => {
        await app.grantAccess(DEFAULT_POLICY);

        const response = await app.multipartPut({
          endpoint: `surveys/${survey1_id}`,
          payload: {
            name: 'Any change will do 2',
            countryNames: [tongaCountry.name],
          },
        });

        // Revert the countryIds back to Vanuatu for other test cases
        await models.survey.update(
          { code: EXISTING_TEST_SURVEY_CODE_1 },
          { country_ids: [vanuatuCountry.id] },
        );

        expectResponseError(
          response,
          /The following countries are not part of the project: Tonga/,
          400,
        );
      });

      it('Insufficient permissions - Should throw an error if project is changed on a survey and any of the saved countries do not belong to the new project', async () => {
        await app.grantAccess(DEFAULT_POLICY);

        const response = await app.multipartPut({
          endpoint: `surveys/${survey1_id}`,
          payload: {
            name: 'Any change will do 2',
            project_id: project2.id,
          },
        });

        // Revert the countryIds back to Vanuatu for other test cases
        await models.survey.update(
          { code: EXISTING_TEST_SURVEY_CODE_1 },
          { country_ids: [vanuatuCountry.id] },
        );

        expectResponseError(
          response,
          /The following countries are not part of the project: Vanuatu/,
          400,
        );
      });

      it('Sufficient permissions - Should pass permissions check if users have BES Admin access to any countries', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);

        const response = await app.multipartPut({
          endpoint: `surveys/${survey1_id}`,
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
          endpoint: `surveys/${survey1_id}`,
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
          endpoint: `surveys/${survey1_id}`,
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
          endpoint: `surveys/${survey1_id}`,
          payload: {
            name: 'Any change will do 6',
            countryNames: [kiribatiCountry.name],
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
          endpoint: `surveys/${survey1_id}`,
          payload: {
            name: 'Any change will do 7',
          },
        });

        expectPermissionError(response, /Need Admin access to Vanuatu/);
      });
    });

    describe('New surveys', async () => {
      it('Sufficient permissions - Should pass permissions user have Tupaia Admin Panel access to the specified countries of the new survey', async () => {
        await app.grantAccess(DEFAULT_POLICY);

        const response = await app.multipartPost({
          endpoint: `surveys`,
          payload: {
            ...BASIC_SURVEY_CREATE_PAYLOAD,
            name: 'NEW_TEST_SURVEY_1', // must be unique
            code: 'NEW_TEST_SURVEY_1', // must be unique
            countryNames: [kiribatiCountry.name],
            'permission_group.name': adminPermissionGroup.name,
            'project.code': project1.code,
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
            countryNames: [kiribatiCountry.name],
            'permission_group.name': adminPermissionGroup.name,
            'project.code': project1.code,
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
            countryNames: [kiribatiCountry.name],
            'permission_group.name': adminPermissionGroup.name,
            'project.code': project1.code,
          },
        });

        expectResponseError(response, /Need Tupaia Admin Panel access to Kiribati/, 500);
      });

      it('Insufficient permissions - Should not pass permissions check if country applied does not belong to the project', async () => {
        await app.grantAccess(DEFAULT_POLICY);

        const response = await app.multipartPost({
          endpoint: `surveys`,
          payload: {
            ...BASIC_SURVEY_CREATE_PAYLOAD,
            name: 'NEW_TEST_SURVEY_3', // must be unique
            code: 'NEW_TEST_SURVEY_3', // must be unique
            countryNames: [tongaCountry.name],
            'permission_group.name': adminPermissionGroup.name,
            'project.code': project1.code,
          },
        });

        expectResponseError(
          response,
          /The following countries are not part of the project: Tonga/,
          400,
        );
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
          name: 'new_survey_import_1_test', // must be unique
          code: 'new_survey_import_1_test', // must be unique
          countryNames: [kiribatiCountry.name],
          'permission_group.name': adminPermissionGroup.name,
          'project.code': project1.code,
        },
        filesByMultipartKey: {
          surveyQuestions: path.resolve(`${TEST_DATA_FOLDER}/surveys/importANewSurvey.xlsx`),
        },
      });
      const { statusCode } = response;

      expect(statusCode).to.equal(200);

      const survey = await models.survey.findOne({ code: 'new_survey_import_1_test' });
      const surveyScreenComponents = await survey.surveyScreenComponents();
      expect(surveyScreenComponents.length).to.equal(2);
    });

    it('Updates survey properties', async () => {
      await app.grantAccess(DEFAULT_POLICY);

      const response = await app.multipartPut({
        endpoint: `surveys/${survey1_id}`,
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

    it('Throws an error if a project is removed from a survey', async () => {
      await app.grantAccess(DEFAULT_POLICY);

      const response = await app.multipartPut({
        endpoint: `surveys/${survey1_id}`,
        payload: {
          name: 'Any change will do 1',
          period_granularity: 'weekly',
          project_id: null,
        },
      });
      expect(response.statusCode).to.equal(500);
      expect(response.body.error).to.equal('Internal server error: Surveys must have a project');
    });

    it('Throws an error if a name is removed from a survey', async () => {
      await app.grantAccess(DEFAULT_POLICY);

      const response = await app.multipartPut({
        endpoint: `surveys/${survey1_id}`,
        payload: {
          name: '',
        },
      });
      expect(response.statusCode).to.equal(500);
      expect(response.body.error).to.equal('Internal server error: Survey name is required');
    });

    it('Throws an error if a permission_group_id is removed from a survey', async () => {
      await app.grantAccess(DEFAULT_POLICY);

      const response = await app.multipartPut({
        endpoint: `surveys/${survey1_id}`,
        payload: {
          permission_group_id: '',
        },
      });
      expect(response.statusCode).to.equal(500);
      expect(response.body.error).to.equal('Internal server error: Permission group is required');
    });

    it('Throws an error if a code is removed from a survey', async () => {
      await app.grantAccess(DEFAULT_POLICY);

      const response = await app.multipartPut({
        endpoint: `surveys/${survey1_id}`,
        payload: {
          code: '',
        },
      });
      expect(response.statusCode).to.equal(500);
      expect(response.body.error).to.equal('Internal server error: Survey code is required');
    });

    it('Throws an error if a country_ids is removed from a survey and set to ""', async () => {
      await app.grantAccess(DEFAULT_POLICY);

      const response = await app.multipartPut({
        endpoint: `surveys/${survey1_id}`,
        payload: {
          country_ids: '',
        },
      });
      expect(response.statusCode).to.equal(500);
      expect(response.body.error).to.equal(
        'Internal server error: Survey must be associated with at least one country',
      );
    });

    it('Throws an error if a country_ids is removed from a survey and set to []', async () => {
      await app.grantAccess(DEFAULT_POLICY);

      const response = await app.multipartPut({
        endpoint: `surveys/${survey1_id}`,
        payload: {
          country_ids: [],
        },
      });
      expect(response.statusCode).to.equal(500);
      expect(response.body.error).to.equal(
        'Internal server error: Survey must be associated with at least one country',
      );
    });

    it('Throws an error if a country_ids is removed from a survey and set to null', async () => {
      await app.grantAccess(DEFAULT_POLICY);

      const response = await app.multipartPut({
        endpoint: `surveys/${survey1_id}`,
        payload: {
          country_ids: null,
        },
      });
      expect(response.statusCode).to.equal(500);
      expect(response.body.error).to.equal(
        'Internal server error: Survey must be associated with at least one country',
      );
    });
  });

  describe('Data Element Validation', () => {
    it('Data elements retain their service type on reimporting of a survey when they are "tupaia" and the survey has a service_type of "dhis"', async () => {
      await app.grantAccess(DEFAULT_POLICY);

      // update the survey and import the questions
      const response = await app.multipartPut({
        endpoint: `surveys/${dhis2SurveyId}`,
        payload: {},
        filesByMultipartKey: {
          surveyQuestions: path.resolve(`${TEST_DATA_FOLDER}/surveys/importAnExistingSurvey.xlsx`),
        },
      });

      const { statusCode } = response;
      expect(statusCode).to.equal(200);

      // check the the data elements have retained their service_type
      EXISTING_QUESTION_CODES.forEach(async code => {
        const dataElement = await models.dataElement.findOne({ code });
        expect(dataElement.service_type).to.equal('tupaia');
      });
    });

    it('Data elements retain their service type when it matches the data group service type when questions are reimported', async () => {
      await app.grantAccess(DEFAULT_POLICY);

      // update the data elements to have a service type of 'dhis'
      await Promise.all(
        EXISTING_QUESTION_CODES.map(code =>
          models.dataElement.update(
            {
              code,
            },
            {
              service_type: 'dhis',
              config: {
                dhisInstanceCode: 'test_instance',
              },
            },
          ),
        ),
      );

      // update the survey and reimport the questions
      const response = await app.multipartPut({
        endpoint: `surveys/${dhis2SurveyId}`,
        payload: {},
        filesByMultipartKey: {
          surveyQuestions: path.resolve(`${TEST_DATA_FOLDER}/surveys/importAnExistingSurvey.xlsx`),
        },
      });

      const { statusCode } = response;
      expect(statusCode).to.equal(200);

      // check the the data elements have retained their service_type
      EXISTING_QUESTION_CODES.forEach(async code => {
        const dataElement = await models.dataElement.findOne({ code });
        expect(dataElement.service_type).to.equal('dhis');
      });
    });

    it('Throws an error when data element has a different service_type to survey data_group and the data_element service_type is NOT "tupaia"', async () => {
      await app.grantAccess(DEFAULT_POLICY);

      // update the survey and reimport the questions
      const response = await app.multipartPut({
        endpoint: `surveys/${survey1_id}`,
        payload: {},
        filesByMultipartKey: {
          surveyQuestions: path.resolve(`${TEST_DATA_FOLDER}/surveys/importAnExistingSurvey.xlsx`),
        },
      });

      const { statusCode } = response;
      expect(statusCode).to.equal(500);
      expect(response.body.error).to.equal(
        `Internal server error: Cannot set service type to 'tupaia': data element 'fdfuu42a22321c123a8_test' is included in data group 'test_survey', which has service type: 'dhis'. These must match.`,
      );
    });
  });
});
