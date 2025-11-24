import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { buildAndInsertSurveys, findOrCreateDummyRecord } from '@tupaia/database';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, BES_ADMIN_PERMISSION_GROUP } from '../../permissions';
import { TestableApp } from '../testUtilities';

describe('Permissions checker for GETSurveyScreenComponents', async () => {
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
  let surveyIds;
  let screenComponentIds;
  let filterString;

  before(async () => {
    // Set up the surveys
    const adminPermission = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Admin',
    });
    const donorPermission = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Donor',
    });
    const vanuatuCountry = await findOrCreateDummyRecord(models.country, { code: 'VU' });
    const laosCountry = await findOrCreateDummyRecord(models.country, { code: 'LA' });

    const surveyModels = await buildAndInsertSurveys(models, [
      {
        code: 'TEST_SURVEY_1',
        name: 'Test Survey 1',
        permission_group_id: adminPermission.id,
        country_ids: [vanuatuCountry.id, laosCountry.id],
        questions: [
          { code: 'TEST_SURVEY_11', text: 'Grumpy' },
          { code: 'TEST_SURVEY_12', text: 'Sleepy' },
        ],
      },
      {
        code: 'TEST_SURVEY_2',
        name: 'Test Survey 2',
        permission_group_id: donorPermission.id,
        country_ids: [vanuatuCountry.id, laosCountry.id],
        questions: [
          { code: 'TEST_SURVEY_21', text: 'Bashful' },
          { code: 'TEST_SURVEY_22', text: 'Doc' },
        ],
      },
    ]);

    surveyIds = surveyModels.map(sm => sm.survey.id);
    const screenComponents = surveyModels.flatMap(sm => sm.surveyScreenComponents);
    screenComponentIds = screenComponents.map(sc => sc.id);
    filterString = `filter={"id":{"comparator":"in","comparisonValue":["${screenComponentIds.join(
      '","',
    )}"]}}`;
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('GET /surveyScreenComponents/:id', async () => {
    it('Sufficient permissions: Return a requested screen component if we have access to the associated survey', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`surveyScreenComponents/${screenComponentIds[0]}`);

      expect(result.id).to.equal(screenComponentIds[0]);
    });

    it('Sufficient permissions: Return a requested screen component if we have BES admin access anywhere', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: result } = await app.get(`surveyScreenComponents/${screenComponentIds[2]}`);

      expect(result.id).to.equal(screenComponentIds[2]);
    });

    it('Insufficient permissions: Throw an error if we do not have permission to the survey associated with the screen component', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`surveyScreenComponents/${screenComponentIds[2]}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /surveyScreenComponents', async () => {
    it('Sufficient permissions: Return all screen components', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(`surveyScreenComponents?${filterString}`);

      expect(results.map(r => r.id)).to.have.members([
        screenComponentIds[0],
        screenComponentIds[1],
      ]);
    });

    it('Sufficient permissions: Return all screen components if we have BES admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`surveyScreenComponents?${filterString}`);

      expect(results.map(r => r.id)).to.have.members(screenComponentIds);
    });

    it('Insufficient permissions: Return an empty array if we do not have access to any screen components', async () => {
      const policy = {
        DL: ['Public'],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(`surveyScreenComponents?${filterString}`);

      expect(results).to.be.empty;
    });
  });

  describe('GET /surveys/id/surveyScreenComponents', async () => {
    it('Sufficient permissions: Return only screen components associated with the selected survey', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(
        `surveys/${surveyIds[0]}/surveyScreenComponents?${filterString}`,
      );

      expect(results.map(r => r.id)).to.have.members([
        screenComponentIds[0],
        screenComponentIds[1],
      ]);
    });

    it('Insufficient permissions: Throw an error if we do not have access to the selected survey', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(
        `surveys/${surveyIds[1]}/surveyScreenComponents?${filterString}`,
      );

      expect(results).to.have.key('error');
    });
  });
});
