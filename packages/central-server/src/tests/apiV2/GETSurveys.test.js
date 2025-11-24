import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { buildAndInsertSurveys, findOrCreateDummyRecord } from '@tupaia/database';
import { resetTestData, TestableApp } from '../testUtilities';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, BES_ADMIN_PERMISSION_GROUP } from '../../permissions';

describe('Permissions checker for GETSurveys', async () => {
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
  let vanuatuCountryId;
  let tongaCountryId;
  let surveyIds;
  let filterString;

  before(async () => {
    await resetTestData();

    // Set up the surveys
    const adminPermission = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Admin',
    });
    const donorPermission = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Donor',
    });
    const vanuatuCountry = await findOrCreateDummyRecord(models.country, { code: 'VU' });
    const laosCountry = await findOrCreateDummyRecord(models.country, { code: 'LA' });
    const tongaCountry = await findOrCreateDummyRecord(models.country, { code: 'TO' });
    vanuatuCountryId = vanuatuCountry.id;
    tongaCountryId = tongaCountry.id;

    const buildResults = await buildAndInsertSurveys(models, [
      {
        code: 'TEST_SURVEY_1',
        name: 'Test Survey 1',
        permission_group_id: adminPermission.id,
        country_ids: [vanuatuCountry.id, laosCountry.id],
      },
      {
        code: 'TEST_SURVEY_2',
        name: 'Test Survey 2',
        permission_group_id: donorPermission.id,
        country_ids: [vanuatuCountry.id, laosCountry.id],
      },
      {
        code: 'TEST_SURVEY_3',
        name: 'Test Survey 3',
        permission_group_id: adminPermission.id,
        country_ids: [tongaCountry.id],
      },
      {
        code: 'TEST_SURVEY_4',
        name: 'Test Survey 4',
        permission_group_id: adminPermission.id,
        country_ids: [laosCountry.id],
      },
    ]);

    surveyIds = buildResults.map(b => b.survey.id);
    filterString = `filter={"id":{"comparator":"in","comparisonValue":["${surveyIds.join(
      '","',
    )}"]}}`;
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('GET /surveys/:id', async () => {
    it('Sufficient permissions: Return a requested survey if we have the permission group for any of the countries within', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`surveys/${surveyIds[0]}`);

      expect(result.id).to.equal(surveyIds[0]);
    });

    it('Sufficient permissions: Return a requested survey if we have BES Admin access anywhere', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: result } = await app.get(`surveys/${surveyIds[2]}`);

      expect(result.id).to.equal(surveyIds[2]);
    });

    it('Insufficient permissions: Throw an error if we do not have the appropriate permission group for the requested survey', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`surveys/${surveyIds[1]}`);

      expect(result).to.have.keys('error');
    });

    it('Insufficient permissions: Throw an error if we have the permission group but not for any of the countries of the survey', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`surveys/${surveyIds[2]}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /surveys', async () => {
    it('Sufficient permissions: Return all surveys we have permissions for', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(`surveys?${filterString}`);

      expect(results.map(r => r.id)).to.have.members([surveyIds[0], surveyIds[3]]);
    });

    it('Sufficient permissions: Return all surveys if we have BES admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`surveys?${filterString}`);

      expect(results.map(r => r.id)).to.have.members(surveyIds);
    });

    it('Insufficient permissions: Return an empty array if users do not have access to any surveys', async () => {
      const policy = {
        DL: ['Public'],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(`surveys?${filterString}`);

      expect(results).to.be.empty;
    });
  });

  describe('GET /countries/id/surveys', async () => {
    it('Sufficient permissions: Return only surveys we have permission for in the selected country', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(
        `countries/${vanuatuCountryId}/surveys?${filterString}`,
      );

      expect(results.map(r => r.id)).to.have.members([surveyIds[0]]);
    });

    it('Sufficient permissions: Return all surveys in the selected country if we are BES admin', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(
        `countries/${vanuatuCountryId}/surveys?${filterString}`,
      );

      expect(results.map(r => r.id)).to.have.members([surveyIds[0], surveyIds[1]]);
    });

    it('Insufficient permissions: Return an empty array if we do not have access to any of the surveys in the selected country', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(
        `countries/${tongaCountryId}/surveys?${filterString}`,
      );

      expect(results).to.be.empty;
    });
  });
});
