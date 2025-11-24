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
import { TestableApp, resetTestData, setupDashboardTestData } from '../../testUtilities';

describe('Permissions checker for DeleteDashboardMailingList', async () => {
  const DEFAULT_POLICY = {
    DL: ['Public'],
    KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    LA: ['Admin'],
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

  describe('DELETE /dashboardMailingLists/:id', async () => {
    describe('Insufficient permission', async () => {
      it('Throw an exception when trying to delete a dashboard mailing list we do not have access to', async () => {
        await app.grantAccess({
          DL: ['Public'],
          KI: ['Public'],
          LA: ['Public'],
        });
        const { body: result } = await app.delete(
          `dashboardMailingLists/${nationalDashboard2MailingList.id}`,
        );

        expect(result).to.have.keys('error');
      });
    });

    describe('Sufficient permission', async () => {
      it('Allow deleting of a dashboard mailing list for a dashboard we have edit permission for', async () => {
        await app.grantAccess({
          DL: ['Public'],
          KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        });
        await app.delete(`dashboardMailingLists/${nationalDashboard1MailingList.id}`);
        const result = await models.dashboardMailingList.find({
          id: nationalDashboard1MailingList.id,
        });

        expect(result.length).to.equal(0);
      });

      it('Allow deleting of a dashboard mailing list by Tupaia Admin user', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);
        await app.delete(`dashboardMailingLists/${nationalDashboard2MailingList.id}`);
        const result = await models.dashboardMailingListEntry.find({
          id: nationalDashboard2MailingList.id,
        });

        expect(result.length).to.equal(0);
      });
    });
  });
});
