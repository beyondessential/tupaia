/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import {
  getTestModels,
  findOrCreateDummyRecord,
  findOrCreateDummyCountryEntity,
} from '../../testUtilities';

const DASHBOARDS = [
  {
    code: 'dashboard1',
    name: 'Dashboard 1',
  },
  {
    code: 'dashboard2',
    name: 'Dashboard 2',
  },
];

const BASE_DASHBOARD_RELATION = {
  entity_types: '{country}',
  project_codes: '{testProject}',
  permission_groups: '{Public}',
};

const DASHBOARD_ITEMS = [
  {
    code: 'dashboardItem1',
    name: 'Dashboard Item 1',
    legacy: false,
  },
  {
    code: 'dashboardItem2',
    name: 'Dashboard Item 2',
    legacy: false,
  },
];

const getResultChildIds = result => result.map(r => r.child_id).sort();

describe('DashboardRelationModel', () => {
  const models = getTestModels();

  const addDashboardItems = item => {
    return findOrCreateDummyRecord(
      models.dashboardItem,
      {
        code: item.code,
      },
      item,
    );
  };

  const addRelation = (dashboardId, dashboardItem, filters = {}) => {
    return findOrCreateDummyRecord(
      models.dashboardRelation,
      {
        dashboard_id: dashboardId,
        child_id: dashboardItem.id,
        attributes_filter: filters,
      },
      BASE_DASHBOARD_RELATION,
    );
  };

  let testEntity;
  let dashboards;
  let dashboardIds;
  let dashboardItems;

  beforeAll(async () => {
    const entityResult = await findOrCreateDummyCountryEntity(models, {
      code: 'test',
      name: 'Test Entity',
      attributes: { test: 'Yes' },
    });

    testEntity = entityResult.entity;

    dashboards = await Promise.all(
      DASHBOARDS.map(dashboard =>
        findOrCreateDummyRecord(models.dashboard, {
          ...dashboard,
          root_entity_code: testEntity.code,
        }),
      ),
    );
    dashboardIds = dashboards.map(d => d.id);

    dashboardItems = await Promise.all(
      DASHBOARD_ITEMS.map(dashboardItem => addDashboardItems(dashboardItem)),
    );
  });

  afterEach(async () => {
    await models.dashboardRelation.delete({ dashboard_id: dashboardIds });
  });

  describe('findDashboardRelationsForEntityAndProject', () => {
    describe('Filtering', () => {
      it('should return all dashboard relations for entity and project when there are no filters on any of the relations', async () => {
        // Add dashboard relations
        await Promise.all(
          dashboardItems.map((dashboardItem, i) => addRelation(dashboards[i].id, dashboardItem)),
        );
        const result = await models.dashboardRelation.findDashboardRelationsForEntityAndProject(
          dashboardIds,
          testEntity.code,
          'testProject',
        );

        expect(result).toHaveLength(2);
      });

      it('should return dashboard items that match entity and project when dashboard relation filters are single values', async () => {
        // Add dashboard relations
        await Promise.all(
          dashboardItems.map((dashboardItem, i) =>
            addRelation(dashboards[i].id, dashboardItem, i === 0 ? { test: 'yes' } : {}),
          ),
        );

        const result = await models.dashboardRelation.findDashboardRelationsForEntityAndProject(
          dashboardIds,
          testEntity.code,
          'testProject',
        );

        expect(getResultChildIds(result)).toEqual(dashboardItems.map(d => d.id).sort());
      });

      it('should return dashboard items that match entity and project when dashboard relation filters are array values', async () => {
        // Add dashboard relations
        await Promise.all(
          dashboardItems.map((dashboardItem, i) =>
            addRelation(dashboards[i].id, dashboardItem, i === 0 ? { test: ['yes', 'no'] } : {}),
          ),
        );

        const result = await models.dashboardRelation.findDashboardRelationsForEntityAndProject(
          dashboardIds,
          testEntity.code,
          'testProject',
        );

        expect(getResultChildIds(result)).toEqual(dashboardItems.map(d => d.id).sort());
      });

      it('should exclude relations when filter is "no" and corresponding entity attribute exists but is not "no"', async () => {
        // Add dashboard relations
        await Promise.all(
          dashboardItems.map((dashboardItem, i) =>
            addRelation(dashboards[i].id, dashboardItem, i === 0 ? { test: ['no'] } : {}),
          ),
        );

        const result = await models.dashboardRelation.findDashboardRelationsForEntityAndProject(
          dashboardIds,
          testEntity.code,
          'testProject',
        );

        expect(getResultChildIds(result)).toEqual([dashboardItems[1].id]);
      });

      it('should include relations when filter is "no" and corresponding entity attribute is undefined', async () => {
        // Add dashboard relations
        await Promise.all(
          dashboardItems.map((dashboardItem, i) =>
            addRelation(dashboards[i].id, dashboardItem, i === 0 ? { someThing: ['no'] } : {}),
          ),
        );

        const result = await models.dashboardRelation.findDashboardRelationsForEntityAndProject(
          dashboardIds,
          testEntity.code,
          'testProject',
        );

        expect(getResultChildIds(result)).toEqual(dashboardItems.map(d => d.id).sort());
      });

      it('should exclude relations when filter is set (but is not "no") and corresponding entity attribute is undefined', async () => {
        // Add dashboard relations
        await Promise.all(
          dashboardItems.map((dashboardItem, i) =>
            addRelation(dashboards[i].id, dashboardItem, i === 0 ? { someThing: ['hi'] } : {}),
          ),
        );

        const result = await models.dashboardRelation.findDashboardRelationsForEntityAndProject(
          dashboardIds,
          testEntity.code,
          'testProject',
        );

        expect(getResultChildIds(result)).toEqual([dashboardItems[1].id]);
      });
    });

    describe('Error handling', () => {
      it('should throw an error when dashboardIds param is undefined', async () => {
        await expect(
          models.dashboardRelation.findDashboardRelationsForEntityAndProject(
            undefined,
            testEntity.code,
            'testProject',
          ),
        ).rejects.toThrow('Dashboard IDs are required');
      });

      it('should throw an error when dashboardIds param is empty', async () => {
        await expect(
          models.dashboardRelation.findDashboardRelationsForEntityAndProject(
            [],
            testEntity.code,
            'testProject',
          ),
        ).rejects.toThrow('Dashboard IDs are required');
      });

      it('should throw an error when entity code param is undefined', async () => {
        await expect(
          models.dashboardRelation.findDashboardRelationsForEntityAndProject(
            dashboardIds,
            undefined,
            'testProject',
          ),
        ).rejects.toThrow('Entity code is required');
      });

      it('should throw an error when project code param is undefined', async () => {
        await expect(
          models.dashboardRelation.findDashboardRelationsForEntityAndProject(
            dashboardIds,
            testEntity.code,
            undefined,
          ),
        ).rejects.toThrow('Project code is required');
      });

      it('should throw an error when entity code is not a valid entity', async () => {
        await expect(
          models.dashboardRelation.findDashboardRelationsForEntityAndProject(
            dashboardIds,
            'some other code',
            'testProject',
          ),
        ).rejects.toThrow("Entity with code 'some other code' not found");
      });
    });
  });
});
