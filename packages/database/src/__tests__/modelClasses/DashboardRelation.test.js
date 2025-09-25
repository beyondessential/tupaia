import {
  findOrCreateDummyCountryEntity,
  findOrCreateDummyRecord,
  getTestModels,
} from '../../server/testUtilities';

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
    code: 'item1',
    name: 'Dashboard Item 1',
    report_code: 'item1',
    legacy: false,
  },
  {
    code: 'item2',
    name: 'Dashboard Item 2',
    report_code: 'item2',
    legacy: false,
  },
];

const getResultChildIds = result => result.map(r => r.child_id).sort();

describe('DashboardRelationModel', () => {
  const models = getTestModels();

  const addDashboardItems = async (item, permissionGroupId) => {
    await findOrCreateDummyRecord(
      models.report,
      {
        code: item.report_code,
      },
      {
        config: {},
        permission_group_id: permissionGroupId,
      },
    );
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
    const publicPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Public',
    });
    const entityResult = await findOrCreateDummyCountryEntity(models, {
      code: 'test',
      name: 'Test Entity',
      attributes: { test1: 'yes', test2: 'maybe', test3: 'no' },
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
      DASHBOARD_ITEMS.map(dashboardItem =>
        addDashboardItems(dashboardItem, publicPermissionGroup.id),
      ),
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

      it('should return dashboard items that match entity and project when dashboard relation filters are set', async () => {
        // Add dashboard relations
        await Promise.all(
          dashboardItems.map((dashboardItem, i) =>
            addRelation(
              dashboards[i].id,
              dashboardItem,
              i === 0 ? { test1: 'yes', test2: ['maybe', 'no'], test3: 'no' } : {},
            ),
          ),
        );

        const result = await models.dashboardRelation.findDashboardRelationsForEntityAndProject(
          dashboardIds,
          testEntity.code,
          'testProject',
        );

        expect(getResultChildIds(result)).toEqual(dashboardItems.map(d => d.id).sort());
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
