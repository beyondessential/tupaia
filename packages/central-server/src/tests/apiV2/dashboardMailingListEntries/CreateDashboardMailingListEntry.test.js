import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import {
  buildAndInsertProjectsAndHierarchies,
  clearTestData,
  findOrCreateDummyRecord,
} from '@tupaia/database';
import { BES_ADMIN_PERMISSION_GROUP } from '../../../permissions';
import {
  TEST_USER_EMAIL,
  TestableApp,
  resetTestData,
  setupDashboardTestData,
} from '../../testUtilities';

describe('Permissions checker for CreateDashboardMailingListEntry', async () => {
  const DEFAULT_POLICY = {
    DL: ['Public'],
    KI: ['Admin'],
  };

  const BES_ADMIN_POLICY = {
    SB: [BES_ADMIN_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;
  let nationalDashboard1MailingList;
  let nationalDashboard2MailingList;

  before(async () => {
    await resetTestData();

    const [{ project, entities }] = await buildAndInsertProjectsAndHierarchies(models, [
      {
        code: 'test_project',
        name: 'Test Project',
        entities: [
          { code: 'KI', country_code: 'KI' },
          { code: 'VU', country_code: 'VU' },
          { code: 'TO', country_code: 'TO' },
          { code: 'SB', country_code: 'SB' },
          { code: 'LA', country_code: 'LA' },
        ],
      },
    ]);

    const { nationalDashboard1, nationalDashboard2 } = await setupDashboardTestData(models);
    nationalDashboard1MailingList = await findOrCreateDummyRecord(models.dashboardMailingList, {
      dashboard_id: nationalDashboard1.id,
      project_id: project.id,
      entity_id: entities.find(({ code }) => code === 'KI').id,
    });
    nationalDashboard2MailingList = await findOrCreateDummyRecord(models.dashboardMailingList, {
      dashboard_id: nationalDashboard2.id,
      project_id: project.id,
      entity_id: entities.find(({ code }) => code === 'LA').id,
    });
  });

  afterEach(async () => {
    app.revokeAccess();
  });

  after(async () => {
    await clearTestData(models.database);
  });

  describe('POST /dashboardMailingListEntries', async () => {
    describe('Sufficient permission', async () => {
      it('Allow creation of a dashboard mailing list entry for a dashboard we have permission for', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        await app.post(`dashboardMailingListEntries`, {
          body: {
            dashboard_mailing_list_id: nationalDashboard1MailingList.id,
            email: TEST_USER_EMAIL,
          },
        });
        const result = await models.dashboardMailingListEntry.find({
          dashboard_mailing_list_id: nationalDashboard1MailingList.id,
        });

        expect(result.length).to.equal(1);
        expect(result[0].email).to.equal(TEST_USER_EMAIL);
        await models.dashboardMailingListEntry.delete({ id: result[0].id }); // Clean up
      });
    });

    describe('Invalid input', async () => {
      it('Throw a input validation error if we do not have email', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.post(`dashboardMailingListEntries`, {
          body: {
            dashboard_mailing_list_id: nationalDashboard1MailingList.id,
          },
        });

        expect(result).to.have.keys('error');
      });

      it('Throw a input validation error if we do not have dashboard_mailing_list_id', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.post(`dashboardMailingListEntries`, {
          body: {
            email: TEST_USER_EMAIL,
          },
        });

        expect(result).to.have.keys('error');
      });
    });
  });
});
