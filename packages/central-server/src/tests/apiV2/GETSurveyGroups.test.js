import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { buildAndInsertSurveys, findOrCreateDummyRecord } from '@tupaia/database';
import { resetTestData, TestableApp } from '../testUtilities';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, BES_ADMIN_PERMISSION_GROUP } from '../../permissions';

describe('Permissions checker for GETSurveyGroups', async () => {
  const DEFAULT_POLICY = {
    DL: ['Public'],
    KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
    VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    LA: ['Admin'],
  };

  const BES_ADMIN_POLICY = {
    LA: [BES_ADMIN_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;
  let surveyGroup1;
  let surveyGroup2;
  let filterString;

  before(async () => {
    await resetTestData();

    // Set up the survey groups and their surveys
    surveyGroup1 = await findOrCreateDummyRecord(models.surveyGroup, {
      name: 'Test survey group 1',
    });
    surveyGroup2 = await findOrCreateDummyRecord(models.surveyGroup, {
      name: 'Test survey group 2',
    });

    const adminPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Admin',
    });
    const donorPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Donor',
    });
    const vanuatuCountry = await findOrCreateDummyRecord(models.country, { code: 'VU' });
    const laosCountry = await findOrCreateDummyRecord(models.country, { code: 'LA' });

    await buildAndInsertSurveys(models, [
      {
        code: 'TEST_SURVEY_1',
        name: 'Test Survey 1',
        permission_group_id: adminPermissionGroup.id,
        country_ids: [vanuatuCountry.id],
        survey_group_id: surveyGroup1.id,
      },
      {
        code: 'TEST_SURVEY_2',
        name: 'Test Survey 2',
        permission_group_id: adminPermissionGroup.id,
        country_ids: [vanuatuCountry.id],
        survey_group_id: surveyGroup1.id,
      },
      {
        code: 'TEST_SURVEY_3',
        name: 'Test Survey 3',
        permission_group_id: donorPermissionGroup.id,
        country_ids: [vanuatuCountry.id],
        survey_group_id: surveyGroup1.id,
      },
      {
        code: 'TEST_SURVEY_4',
        name: 'Test Survey 4',
        permission_group_id: adminPermissionGroup.id,
        country_ids: [laosCountry.id],
        survey_group_id: surveyGroup2.id,
      },
    ]);
    const surveyGroupIds = [surveyGroup1.id, surveyGroup2.id];
    filterString = `filter={"id":{"comparator":"in","comparisonValue":["${surveyGroupIds.join(
      '","',
    )}"]}}`;
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('GET /surveyGroups/:id', async () => {
    it('Sufficient permissions: Should return a requested survey group that users have access to any of the surveys within the groups', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`surveyGroups/${surveyGroup1.id}`);

      expect(result.id).to.equal(surveyGroup1.id);
    });

    it('Insufficient permissions: Should throw an error if requesting survey group that users do not have access to any of the surveys within the group', async () => {
      // Remove Admin permission of VU to have insufficient permissions to access surveyGroup1.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /* 'Admin' */],
        LA: ['Admin'],
      };
      await app.grantAccess(policy);
      const { body: result } = await app.get(`surveyGroups/${surveyGroup1.id}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /surveyGroups', async () => {
    it('Sufficient permissions: Should return all survey groups the user has permission to', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(`surveyGroups?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([surveyGroup1.id, surveyGroup2.id]);
    });

    it('Sufficient permissions: Should filter survey groups if user only has some permissions', async () => {
      // Remove Admin permission of VU to have insufficient permissions to access surveyGroup1.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /* 'Admin' */],
        LA: ['Admin'],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(`surveyGroups?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([surveyGroup2.id]);
    });

    it('Sufficient permissions: Should return all survey groups if the user has BES admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`surveyGroups?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([surveyGroup1.id, surveyGroup2.id]);
    });

    it('Insufficient permissions: Should return an empty array if users do not have access to any survey groups', async () => {
      const policy = {
        DL: ['Public'],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(`surveyGroups?${filterString}`);

      expect(results).to.be.empty;
    });
  });
});
