import {
  buildAndInsertProjectsAndHierarchies,
  clearTestData,
  findOrCreateDummyRecord,
} from '@tupaia/database';
import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp, resetTestData, setupDashboardTestData } from '../../testUtilities';

describe('Permissions checker for EditDashboardMailingList', async () => {
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
  let project;
  let entities;
  let nationalDashboard1;
  let nationalDashboard2;
  let nationalDashboard1MailingList;
  let nationalDashboard2MailingList;

  before(async () => {
    await resetTestData();

    [{ project, entities }] = await buildAndInsertProjectsAndHierarchies(models, [
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

  describe('PUT /dashboardMailingLists/:id', async () => {
    describe('Insufficient permission', async () => {
      it('Throw an exception when trying to edit a dashboard mailing list we do not have access to', async () => {
        await app.grantAccess({
          DL: ['Admin'],
          KI: ['Admin'],
        });
        const { body: result } = await app.put(
          `dashboardMailingLists/${nationalDashboard2MailingList.id}`,
          {
            body: {
              project_id: project.id,
            },
          },
        );

        expect(result).to.have.keys('error');
      });

      it('Throw an exception when trying to edit a dashboard mailing list to a different dashboard we do not have edit access to', async () => {
        await app.grantAccess({
          DL: ['Public'],
          KI: ['Public'],
          LA: ['Public'],
        });
        const { body: result } = await app.put(
          `dashboardMailingLists/${nationalDashboard1MailingList.id}`,
          {
            body: {
              dashboard_id: nationalDashboard2.id,
            },
          },
        );

        expect(result).to.have.keys('error');
      });
    });

    describe('Sufficient permission', async () => {
      it('Allow editing a dashboard mailing list for a dashboard we have permission for', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const newEntityId = entities.find(({ code }) => code === 'SB').id;
        await app.put(`dashboardMailingLists/${nationalDashboard1MailingList.id}`, {
          body: {
            entity_id: newEntityId,
          },
        });
        const result = await models.dashboardMailingList.findById(nationalDashboard1MailingList.id);

        expect(result.entity_id).to.equal(newEntityId);
      });

      it('Allow editing of a dashboard mailing list by Tupaia Admin user', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);
        const newEntityId = entities.find(({ code }) => code === 'SB').id;
        await app.put(`dashboardMailingLists/${nationalDashboard2MailingList.id}`, {
          body: {
            entity_id: newEntityId,
          },
        });
        const result = await models.dashboardMailingList.findById(nationalDashboard2MailingList.id);

        expect(result.entity_id).to.equal(newEntityId);
      });
    });
  });
});
