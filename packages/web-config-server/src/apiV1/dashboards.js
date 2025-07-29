import { orderBy } from 'es-toolkit/compat';
import { RouteHandler } from './RouteHandler';
import { NoPermissionRequiredChecker } from './permissions';

const NO_DATA_AT_LEVEL_DASHBOARD_ITEM_CODE = 'no_data_at_level';
const NO_ACCESS_DASHBOARD_ITEM_CODE = 'no_access';

export default class extends RouteHandler {
  static PermissionsChecker = NoPermissionRequiredChecker;

  buildResponse = async () => {
    const { entity, query } = this;
    const hierarchyId = await this.fetchHierarchyId();
    // Fetch dashboards
    const dashboards = await this.models.dashboard.getDashboards(entity, hierarchyId);
    if (!dashboards.length) {
      return this.getStaticDashboard(entity, NO_DATA_AT_LEVEL_DASHBOARD_ITEM_CODE);
    }

    const dashboardsWithItems = await this.getDashboardsWithItems(
      dashboards,
      entity,
      query.projectCode,
    );
    const allDashboardRelationsAtLevel = await this.models.dashboardRelation.find({
      dashboard_id: dashboards.map(d => d.id),
      entity_types: {
        comparator: '@>',
        comparisonValue: [entity.type],
      },
      project_codes: {
        comparator: '@>',
        comparisonValue: [query.projectCode],
      },
    });

    if (!dashboardsWithItems.length && !allDashboardRelationsAtLevel.length) {
      return this.getStaticDashboard(entity, NO_DATA_AT_LEVEL_DASHBOARD_ITEM_CODE);
    }

    if (!dashboardsWithItems.length && allDashboardRelationsAtLevel.length) {
      return this.getStaticDashboard(entity, NO_ACCESS_DASHBOARD_ITEM_CODE);
    }

    return dashboardsWithItems;
  };

  getDashboardsWithItems = async (dashboards, entity, projectCode) => {
    const permissionGroups = await this.req.getPermissionGroups(entity.code);
    const sortedDashboards = orderBy(dashboards, ['sort_order', 'name']);
    const userFavouriteDashboardItems = await this.getUserFavouriteDashboardItems();

    return (
      await Promise.all(
        sortedDashboards.map(async dashboard => {
          const dashboardItems = await this.models.dashboardItem.fetchItemsInDashboard(
            dashboard.id,
            [entity.type],
            permissionGroups,
            [projectCode],
          );

          if (dashboardItems.length === 0) {
            return null;
          }

          return {
            dashboardName: dashboard.name,
            dashboardId: dashboard.id,
            dashboardCode: dashboard.code,
            entityType: entity.type,
            entityCode: entity.code,
            entityName: entity.name,
            items: dashboardItems.map(item => ({
              code: item.code,
              legacy: item.legacy,
              reportCode: item.report_code,
              ...item.config,
              isFavourite: userFavouriteDashboardItems
                ? userFavouriteDashboardItems.includes(item.code)
                : null,
            })),
          };
        }),
      )
    ).filter(d => d !== null);
  };

  getStaticDashboard = async (entity, staticDashboardItemCode) => {
    const staticDashboardItem = await this.models.dashboardItem.findOne({
      code: staticDashboardItemCode,
    });

    return [
      {
        dashboardName: 'General', // just a dummy dashboard
        dashboardId: 'General',
        dashboardCode: 'General',
        entityType: entity.type,
        entityCode: entity.code,
        entityName: entity.name,
        items: [
          {
            code: staticDashboardItem.code,
            legacy: staticDashboardItem.legacy,
            reportCode: staticDashboardItem.report_code,
            ...staticDashboardItem.config,
          },
        ],
      },
    ];
  };

  getUserFavouriteDashboardItems = async () => {
    const { userId } = this.req?.userJson;
    if (!userId) {
      return null;
    }

    const result = await this.req.models.userFavouriteDashboardItem.find({
      user_id: userId,
    });

    return result.map(item => item.dashboard_item_code);
  };
}
