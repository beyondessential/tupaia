/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildAndInsertProjectsAndHierarchies, clearTestData } from '@tupaia/database';
import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp, resetTestData, setupDashboardTestData } from '../../testUtilities';

describe('Permissions checker for CreateDashboardMailingList', () => {
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

  beforeAll(async () => {
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
  });

  afterEach(async () => {
    app.revokeAccess();
  });

  afterAll(async () => {
    await clearTestData(models.database);
  });

  describe('POST /dashboardMailingLists', () => {
    describe('Insufficient permission', () => {
      it('Throw an exception when trying to create a dashboard mailing list to a dashboard we do not have access to', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.post(`dashboardMailingLists`, {
          body: {
            dashboard_id: nationalDashboard2.id,
            project_id: project.id,
            entity_id: entities.find(({ code }) => code === 'KI').id,
          },
        });

        expect(result).toHaveProperty('error');
      });
    });

    describe('Sufficient permission', () => {
      it('Allow creation of a dashboard mailing list entry for a dashboard we have permission for', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        await app.post(`dashboardMailingLists`, {
          body: {
            dashboard_id: nationalDashboard1.id,
            project_id: project.id,
            entity_id: entities.find(({ code }) => code === 'KI').id,
          },
        });
        const result = await models.dashboardMailingList.find({
          dashboard_id: nationalDashboard1.id,
        });

        expect(result.length).toBe(1);
        await models.dashboardMailingList.delete({ id: result[0].id }); // Clean up
      });

      it('Allow creation of a dashboard mailing list by Tupaia Admin user', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);
        await app.post(`dashboardMailingLists`, {
          body: {
            dashboard_id: nationalDashboard2.id,
            project_id: project.id,
            entity_id: entities.find(({ code }) => code === 'KI').id,
          },
        });
        const result = await models.dashboardMailingList.find({
          dashboard_id: nationalDashboard2.id,
        });

        expect(result.length).toBe(1);
        await models.dashboardMailingList.delete({ id: result[0].id }); // Clean up
      });
    });

    describe('Invalid input', () => {
      it('Throw a input validation error if we do not have dashboard_id', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.post(`dashboardMailingLists`, {
          body: {
            project_id: project.id,
            entity_id: entities.find(({ code }) => code === 'KI').id,
          },
        });

        expect(result).toHaveProperty('error');
      });

      it('Throw a input validation error if we do not have project_id', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.post(`dashboardMailingLists`, {
          body: {
            dashboard_id: nationalDashboard1.id,
            entity_id: entities.find(({ code }) => code === 'KI').id,
          },
        });

        expect(result).toHaveProperty('error');
      });

      it('Throw a input validation error if we do not have entity_id', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.post(`dashboardMailingLists`, {
          body: {
            dashboard_id: nationalDashboard1.id,
            project_id: project.id,
          },
        });

        expect(result).toHaveProperty('error');
      });
    });
  });
});
