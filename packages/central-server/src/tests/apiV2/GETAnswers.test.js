import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import {
  buildAndInsertSurveys,
  buildAndInsertSurveyResponses,
  findOrCreateDummyRecord,
} from '@tupaia/database';
import { resetTestData, TestableApp } from '../testUtilities';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, BES_ADMIN_PERMISSION_GROUP } from '../../permissions';

describe('Permissions checker for GETAnswers', async () => {
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
  let vanuatuAdminResponseId;
  let vanuatuDonorResponseId;
  let vanuatuAdminAnswers;
  let vanuatuDonorAnswers;
  let filterString;

  before(async () => {
    await resetTestData();

    const adminPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Admin',
    });
    const donorPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Donor',
    });

    const vanuatuCountry = await findOrCreateDummyRecord(models.country, { code: 'VU' });

    const vanuatuEntity = await findOrCreateDummyRecord(models.entity, {
      country_code: vanuatuCountry.code,
    });

    await buildAndInsertSurveys(models, [
      {
        code: 'TEST_SURVEY_1',
        name: 'Test Survey 1',
        permission_group_id: adminPermissionGroup.id,
        questions: [{ code: 'TEST_SURVEY_11', text: 'Best spice' }],
      },
      {
        code: 'TEST_SURVEY_2',
        name: 'Test Survey 2',
        permission_group_id: donorPermissionGroup.id,
        questions: [{ code: 'TEST_SURVEY_21', text: 'Worst spice' }],
      },
    ]);

    const [vanuatuAdminBuild, vanuatuDonorBuild] = await buildAndInsertSurveyResponses(models, [
      {
        surveyCode: 'TEST_SURVEY_1',
        entityCode: vanuatuEntity.code,
        data_time: '2020-01-31T09:00:00',
        answers: { TEST_SURVEY_11: 'Scary' },
      },
      {
        surveyCode: 'TEST_SURVEY_2',
        entityCode: vanuatuEntity.code,
        data_time: '2020-01-31T09:00:00',
        answers: { TEST_SURVEY_21: 'Sporty' },
      },
    ]);

    vanuatuAdminResponseId = vanuatuAdminBuild.surveyResponse.id;
    vanuatuDonorResponseId = vanuatuDonorBuild.surveyResponse.id;

    vanuatuAdminAnswers = vanuatuAdminBuild.answers.map(a => a.id);
    vanuatuDonorAnswers = vanuatuDonorBuild.answers.map(a => a.id);
    const answerIds = [...vanuatuAdminAnswers, ...vanuatuDonorAnswers];
    filterString = `filter={"id":{"comparator":"in","comparisonValue":["${answerIds.join(
      '","',
    )}"]}}`;
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('GET /answers/:id', async () => {
    it("Sufficient permissions: Return a requested answer if we have permission for the survey in the response's country", async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`answers/${vanuatuAdminAnswers[0]}`);

      expect(result.id).to.equal(vanuatuAdminAnswers[0]);
    });

    it('Sufficient permissions: Return a requested answer if we have BES admin access anywhere', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: result } = await app.get(`answers/${vanuatuDonorAnswers[0]}`);

      expect(result.id).to.equal(vanuatuDonorAnswers[0]);
    });

    it("Insufficient permissions: Throw an error if we do not have permission for the survey in the response's country for this answer", async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`answers/${vanuatuDonorAnswers[0]}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /answer', async () => {
    it('Sufficient permissions: Return only answers we have permission to the survey responses for', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(`answers?${filterString}`);

      expect(results.map(r => r.id)).to.have.members(vanuatuAdminAnswers);
    });

    it('Sufficient permissions: Always return all answers if we have BES admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`answers?${filterString}`);

      expect(results.map(r => r.id)).to.have.members(
        vanuatuAdminAnswers.concat(vanuatuDonorAnswers),
      );
    });

    it('Insufficient permissions: Return an empty array if we do not have access to any of the requested answers', async () => {
      const policy = {
        DL: ['Public'],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(`answers?${filterString}`);

      expect(results).to.be.empty;
    });
  });

  describe('GET /surveyResponses/id/answers', async () => {
    it("Sufficient permissions: Return the answers for the requested survey response if we have permission to the survey in the response's country", async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(`surveyResponses/${vanuatuAdminResponseId}/answers`);

      expect(results.map(r => r.id)).to.have.members(vanuatuAdminAnswers);
    });

    it('Sufficient permissions: Return the answers for the requested survey response if we are BES Admin', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`surveyResponses/${vanuatuDonorResponseId}/answers`);

      expect(results.map(r => r.id)).to.have.members(vanuatuDonorAnswers);
    });

    it('Insufficient permissions: Throw an error if we do not have permissions for the survey response we are requesting the answers for', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(`surveyResponses/${vanuatuDonorResponseId}/answers`);

      expect(results).to.have.key('error');
    });
  });
});
