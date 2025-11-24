import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import {
  buildAndInsertProjectsAndHierarchies,
  clearTestData,
  findOrCreateDummyRecord,
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

describe('Permissions checker for EditDashboardMailingListEntry', async () => {
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
  let mailingListEntryWithAccess;
  let mailingListEntryWithoutAccess;
  let mailingListEntryDiffUser;
  let mailingListEntryBesAdminUser;

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

    // Create the mailing list entries
    mailingListEntryWithAccess = await findOrCreateDummyRecord(models.dashboardMailingListEntry, {
      dashboard_mailing_list_id: nationalDashboard1MailingList.id,
      email: TEST_USER_EMAIL,
      subscribed: true,
    });

    mailingListEntryDiffUser = await findOrCreateDummyRecord(models.dashboardMailingListEntry, {
      dashboard_mailing_list_id: nationalDashboard1MailingList.id,
      email: 'not.my.email@domain.com',
      subscribed: true,
    });

    mailingListEntryBesAdminUser = await findOrCreateDummyRecord(models.dashboardMailingListEntry, {
      dashboard_mailing_list_id: nationalDashboard2MailingList.id,
      email: 'bes-admin-editme@domain.com',
      subscribed: true,
    });

    mailingListEntryWithoutAccess = await findOrCreateDummyRecord(
      models.dashboardMailingListEntry,
      {
        dashboard_mailing_list_id: nationalDashboard2MailingList.id,
        email: TEST_USER_EMAIL,
        subscribed: true,
      },
    );
  });

  afterEach(async () => {
    app.revokeAccess();
  });

  after(async () => {
    await clearTestData(models.database);
  });

  describe('PUT /dashboardMailingListEntries/:id', async () => {
    describe('Insufficient permission', async () => {
      it('Throw an exception when trying to edit a dashboard mailing list entry to a dashboard we do not have access to', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.put(
          `dashboardMailingListEntries/${mailingListEntryWithoutAccess.id}`,
          {
            body: {
              subscribed: true,
            },
          },
        );

        expect(result).to.have.keys('error');
      });

      it('Throw an exception when trying to edit a dashboard mailing list entry to a different dashboard we do not have read access to', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.put(
          `dashboardMailingListEntries/${mailingListEntryWithAccess.id}`,
          {
            body: {
              dashboard_mailing_list_id: nationalDashboard2MailingList.id,
            },
          },
        );

        expect(result).to.have.keys('error');
      });
    });

    describe('Sufficient permission', async () => {
      it('Allow editing a dashboard mailing list entry for a dashboard we have permission for', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        await app.put(`dashboardMailingListEntries/${mailingListEntryWithAccess.id}`, {
          body: {
            subscribed: false,
          },
        });
        const result = await models.dashboardMailingListEntry.find({
          dashboard_mailing_list_id: nationalDashboard1MailingList.id,
          email: TEST_USER_EMAIL,
        });

        expect(result[0].subscribed).to.equal(false);
      });

      it('Allow unsubscribing a dashboard mailing list entry for a dashboard we do not have permission for if its our own email', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        await app.put(`dashboardMailingListEntries/${mailingListEntryWithoutAccess.id}`, {
          body: {
            subscribed: false,
          },
        });
        const result = await models.dashboardMailingListEntry.find({
          dashboard_mailing_list_id: nationalDashboard2MailingList.id,
          email: TEST_USER_EMAIL,
        });

        expect(result[0].subscribed).to.equal(false);
      });

      it('Allow editing of a dashboard mailing list entry for a dashboard we have edit permission for with a different users email', async () => {
        await app.grantAccess({
          DL: ['Public'],
          KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        });
        await app.put(`dashboardMailingListEntries/${mailingListEntryDiffUser.id}`, {
          body: {
            subscribed: false,
          },
        });
        const result = await models.dashboardMailingListEntry.find({
          dashboard_mailing_list_id: nationalDashboard1MailingList.id,
          email: 'not.my.email@domain.com',
        });

        expect(result[0].subscribed).to.equal(false);
      });

      it('Allow editing of a dashboard mailing list entry for Tupaia Admin user', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);
        await app.put(`dashboardMailingListEntries/${mailingListEntryBesAdminUser.id}`, {
          body: {
            subscribed: false,
          },
        });
        const result = await models.dashboardMailingListEntry.find({
          dashboard_mailing_list_id: nationalDashboard2MailingList.id,
          email: 'bes-admin-editme@domain.com',
        });

        expect(result[0].subscribed).to.equal(false);
      });
    });
  });
});
