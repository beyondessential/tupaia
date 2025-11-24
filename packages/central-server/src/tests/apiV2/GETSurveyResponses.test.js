import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;

import {
  buildAndInsertSurveyResponses,
  buildAndInsertSurveys,
  findOrCreateDummyRecord,
} from '@tupaia/database';

import { BES_ADMIN_PERMISSION_GROUP, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions';
import { getRewardsForUser } from '../../social/getRewardsForUser';
import { TestableApp, resetTestData } from '../testUtilities';

describe('Permissions checker for GETSurveyResponses', async () => {
  const DEFAULT_POLICY = {
    DL: ['Public'],
    KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
    VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    LA: ['Admin'],
  };

  const BES_ADMIN_POLICY = {
    SB: [BES_ADMIN_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;
  let laosAdminResponseId;
  let laosDonorResponseId;
  let vanuatuAdminResponseId;
  let vanuatuDonorResponseId;
  let filterString;
  let vanuatuCountry;
  let laosCountry;

  before(async () => {
    await resetTestData();

    const adminPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Admin',
    });
    const donorPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Donor',
    });

    vanuatuCountry = await findOrCreateDummyRecord(models.country, { code: 'VU', name: 'Vanuatu' });
    laosCountry = await findOrCreateDummyRecord(models.country, { code: 'LA', name: 'Laos' });

    const vanuatuEntity = await findOrCreateDummyRecord(models.entity, {
      country_code: vanuatuCountry.code,
    });
    const laosEntity = await findOrCreateDummyRecord(models.entity, {
      country_code: laosCountry.code,
    });

    await buildAndInsertSurveys(models, [
      {
        code: 'TEST_SURVEY_1',
        name: 'Test Survey 1',
        permission_group_id: adminPermissionGroup.id,
      },
      {
        code: 'TEST_SURVEY_2',
        name: 'Test Survey 2',
        permission_group_id: donorPermissionGroup.id,
      },
    ]);

    const [vanuatuAdminBuild, laosAdminBuild, vanuatuDonorBuild, laosDonorBuild] =
      await buildAndInsertSurveyResponses(models, [
        {
          id: vanuatuAdminResponseId,
          surveyCode: 'TEST_SURVEY_1',
          entityCode: vanuatuEntity.code,
          data_time: '2020-01-31T09:00:00',
          answers: [],
        },
        {
          id: laosAdminResponseId,
          surveyCode: 'TEST_SURVEY_1',
          entityCode: laosEntity.code,
          data_time: '2020-01-31T09:00:00',
          answers: [],
        },
        {
          id: vanuatuDonorResponseId,
          surveyCode: 'TEST_SURVEY_2',
          entityCode: vanuatuEntity.code,
          data_time: '2020-01-31T09:00:00',
          answers: [],
        },
        {
          id: laosDonorResponseId,
          surveyCode: 'TEST_SURVEY_2',
          entityCode: laosEntity.code,
          data_time: '2020-01-31T09:00:00',
          answers: [],
        },
      ]);

    laosAdminResponseId = laosAdminBuild.surveyResponse.id;
    laosDonorResponseId = laosDonorBuild.surveyResponse.id;
    vanuatuAdminResponseId = vanuatuAdminBuild.surveyResponse.id;
    vanuatuDonorResponseId = vanuatuDonorBuild.surveyResponse.id;

    const surveyResponseIds = [
      laosAdminResponseId,
      laosDonorResponseId,
      vanuatuAdminResponseId,
      vanuatuDonorResponseId,
    ];
    filterString = `filter={"id":{"comparator":"in","comparisonValue":["${surveyResponseIds.join(
      '","',
    )}"]}}`;
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('GET /surveyResponses/:id', async () => {
    it("Sufficient permissions: Return a requested survey response if we have permission for the survey in the response's country", async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`surveyResponses/${vanuatuAdminResponseId}`);

      expect(result.id).to.equal(vanuatuAdminResponseId);
    });

    it('Sufficient permissions: Return a requested survey response if we have BES admin access anywhere', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: result } = await app.get(`surveyResponses/${laosAdminResponseId}`);

      expect(result.id).to.equal(laosAdminResponseId);
    });

    it("Insufficient permissions: Throw an error if we do not have permission for the survey in the response's country", async () => {
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /* 'Admin' */],
        LA: ['Admin'],
      };
      await app.grantAccess(policy);
      const { body: result } = await app.get(`surveyResponses/${vanuatuAdminResponseId}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /surveyResponses', async () => {
    it('Sufficient permissions: Return only survey responses we have permissions to the survey in the response country', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(`surveyResponses?${filterString}`);

      expect(results.map(r => r.id)).to.have.members([laosAdminResponseId, vanuatuAdminResponseId]);
    });

    it('Sufficient permissions: Always return all survey responses if we have BES admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`surveyResponses?${filterString}`);

      expect(results.map(r => r.id)).to.have.members([
        laosAdminResponseId,
        laosDonorResponseId,
        vanuatuAdminResponseId,
        vanuatuDonorResponseId,
      ]);
    });

    it('Insufficient permissions: Return an empty array if we do not have access to any of the requested survey responses', async () => {
      const policy = {
        DL: ['Public'],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(`surveyResponses?${filterString}`);

      expect(results).to.be.empty;
    });

    it('Joins completed: Return all survey responses with a country name attached to the response', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(
        `surveyResponses?${filterString}&columns=["country.name"]`,
      );

      expect(results.map(r => r['country.name'])).to.have.members([
        // Duplicates of Vanuatu and Laos expected as four survey responses in test DB (two each from Vanuatu and Laos)
        vanuatuCountry.name,
        laosCountry.name,
        vanuatuCountry.name,
        laosCountry.name,
      ]);
    });

    it('gets user rewards', async () => {
      await app.grantAccess(DEFAULT_POLICY);

      const { body: results } = await app.get('surveyResponses');

      const userId = results[0].user_id;
      const rewards = await getRewardsForUser(app.database, userId);

      expect(rewards.coconuts).to.equal(4);
    });

    it('gets rewards with a project_id', async () => {
      await app.grantAccess(DEFAULT_POLICY);

      const { body: results } = await app.get('surveyResponses');

      const userId = results[0].user_id;
      const projectId = 'testId';
      // The test data doesn't have project ids, but still want to make sure that it handles the param and returns the correct rewards
      const rewards = await getRewardsForUser(app.database, userId, projectId);
      expect(rewards.coconuts).to.equal(0);
    });
  });
});
