import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import {
  findOrCreateDummyRecord,
  buildAndInsertProjectsAndHierarchies,
  clearTestData,
} from '@tupaia/database';
import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../../permissions';
import {
  TEST_USER_EMAIL,
  TestableApp,
  resetTestData,
  setupDashboardTestData,
} from '../../testUtilities';

describe('Permissions checker for GETDashboardMailingListEntries', async () => {
  const DEFAULT_POLICY = {
    DL: ['Public'],
    KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    LA: ['Admin'],
  };

  const BES_ADMIN_POLICY = {
    LA: [BES_ADMIN_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;
  let nationalDashboard1;
  let nationalDashboard2;
  let nationalDashboard1MailingList;
  let nationalDashboard2MailingList;
  const nationalDashboard1MailingListEntries = [];
  const nationalDashboard2MailingListEntries = [];

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

    ({ nationalDashboard1, nationalDashboard2 } = await setupDashboardTestData(models));

    // Create the mailing list entries
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
    nationalDashboard1MailingListEntries.push(
      await findOrCreateDummyRecord(models.dashboardMailingListEntry, {
        dashboard_mailing_list_id: nationalDashboard1MailingList.id,
        email: TEST_USER_EMAIL,
        subscribed: true,
      }),
    );
    nationalDashboard2MailingListEntries.push(
      await findOrCreateDummyRecord(models.dashboardMailingListEntry, {
        dashboard_mailing_list_id: nationalDashboard2MailingList.id,
        email: TEST_USER_EMAIL,
        subscribed: true,
      }),
    );
  });

  afterEach(() => {
    app.revokeAccess();
  });

  after(async () => {
    await clearTestData(models.database);
  });

  describe('GET /dashboardMailingListEntries/:id', async () => {
    it('Sufficient permissions: Should return a requested dashboard mailing list entry if users have access to the dashboard', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(
        `dashboardMailingListEntries/${nationalDashboard1MailingListEntries[0].id}`,
      );

      expect(result.id).to.equal(nationalDashboard1MailingListEntries[0].id);
    });

    it('Insufficient permissions: Should throw an exception if users do not have access to any of the inner dashboard relations', async () => {
      // Remove Admin permission of KI to have insufficient permissions to access nationalDashboard1MailingList entries.
      const policy = {
        DL: ['Public'],
        KI: [/* 'Admin' */ 'Public'],
        LA: ['Admin', 'Public'],
      };
      await app.grantAccess(policy);
      const { body: result } = await app.get(
        `dashboardMailingListEntries/${nationalDashboard1MailingListEntries[0].id}`,
      );

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /dashboardMailingListEntries', async () => {
    it('Sufficient permissions: Return only the mailing list entries of dashboards we have permissions for', async () => {
      const policy = {
        DL: ['Public'],
        KI: ['Admin'],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(`dashboardMailingListEntries`);

      expect(results.map(r => r.id)).to.deep.equal([nationalDashboard1MailingListEntries[0].id]);
    });

    it('Sufficient permissions: Should return the all dashboard mailing list entries if we have BES Admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`dashboardMailingListEntries`);

      const allDashboardMailingListEntries = nationalDashboard1MailingListEntries.concat(
        nationalDashboard2MailingListEntries,
      );

      expect(results.map(r => r.id).sort()).to.deep.equal(
        allDashboardMailingListEntries.map(r => r.id).sort(),
      );
    });

    it('Insufficient permissions: Should return an empty array if we have permissions for no dashboards', async () => {
      const policy = {
        DL: ['Public'],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(`dashboardMailingListEntries`);

      expect(results).to.be.empty;
    });
  });

  describe('GET /dashboardMailingLists/:parentId/dashboardMailingListEntries', async () => {
    it('Sufficient permissions: Return mailing list entries for a dashboard we have permissions for', async () => {
      const policy = {
        DL: ['Public'],
        KI: ['Admin'],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(
        `dashboardMailingLists/${nationalDashboard1MailingList.id}/dashboardMailingListEntries`,
      );

      expect(results.map(r => r.id)).to.deep.equal([nationalDashboard1MailingListEntries[0].id]);
    });

    it('Insufficient permissions: Should return an empty array if we do not have permissions for the dashboard', async () => {
      const policy = {
        DL: ['Public'],
        KI: ['Admin'],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(
        `dashboardMailingLists/${nationalDashboard2MailingList.id}/dashboardMailingListEntries`,
      );

      expect(results).to.be.empty;
    });
  });
});
