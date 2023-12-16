/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  findOrCreateDummyRecord,
  buildAndInsertProjectsAndHierarchies,
  clearTestData,
} from '@tupaia/database';
import { TestableApp, resetTestData, setupDashboardTestData } from '../../testUtilities';

describe('Permissions checker for GETDashboardMailingLists', () => {
  const NO_ACCESS_POLICY = {
    DL: ['Public'],
  };

  const app = new TestableApp();
  const { models } = app;
  let nationalDashboard1;
  let nationalDashboard2;
  let nationalDashboard1MailingList;
  let nationalDashboard2MailingList;

  beforeAll(async () => {
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
  });

  afterEach(() => {
    app.revokeAccess();
  });

  afterAll(async () => {
    await clearTestData(models.database);
  });

  describe('GET /dashboardMailingLists/:id', () => {
    it('Sufficient permissions: Anyone can view a dashboard mailing list', async () => {
      await app.grantAccess(NO_ACCESS_POLICY);
      const { body: result } = await app.get(
        `dashboardMailingLists/${nationalDashboard1MailingList.id}`,
      );

      expect(result.id).toBe(nationalDashboard1MailingList.id);
    });
  });

  describe('GET /dashboardMailingLists', () => {
    it('Sufficient permissions: Anyone can view all dashboard mailing lists', async () => {
      await app.grantAccess(NO_ACCESS_POLICY);
      const { body: results } = await app.get(`dashboardMailingLists`);

      expect(results.map(r => r.id)).toStrictEqual([
        nationalDashboard1MailingList.id,
        nationalDashboard2MailingList.id,
      ]);
    });
  });
});
