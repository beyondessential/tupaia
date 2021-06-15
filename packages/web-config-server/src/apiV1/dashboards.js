/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { filterEntities } from '@tupaia/utils';
import orderBy from 'lodash.orderby';
import { RouteHandler } from './RouteHandler';
import { NoPermissionRequiredChecker } from './permissions';

const NO_DATA_AT_LEVEL_DASHBOARD_ITEM_CODE = 'no_data_at_level';
const NO_ACCESS_DASHBOARD_ITEM_CODE = 'no_access';

const checkEntityAgainstConditions = (entity, conditions = {}) =>
  filterEntities([entity], conditions).length === 1;

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
    const possibleDashboardRelations = await this.models.dashboardRelation.find({
      dashboard_id: dashboards.map(d => d.id),
    });

    if (!dashboardsWithItems.length && possibleDashboardRelations.length) {
      return this.getStaticDashboard(entity, NO_ACCESS_DASHBOARD_ITEM_CODE);
    }

    return dashboardsWithItems;
  };

  getDashboardsWithItems = async (dashboards, entity, projectCode) => {
    const permissionGroups = await this.req.getUserGroups(entity.code);
    const sortedDashboards = orderBy(dashboards, ['sort_order', 'name']);

    return (
      await Promise.all(
        Object.values(sortedDashboards).map(async dashboard => {
          const dashboardItems = await this.models.dashboardItem.fetchItemsInDashboard(
            dashboard.id,
            [entity.type],
            permissionGroups,
            [projectCode],
          );
          const filteredDashboardItems = dashboardItems.filter(dashboardItem => {
            const { displayOnEntityConditions } = dashboardItem.config;
            return checkEntityAgainstConditions(entity, displayOnEntityConditions);
          });

          if (filteredDashboardItems.length === 0) {
            return null;
          }

          return {
            dashboardName: dashboard.name,
            dashboardId: dashboard.id,
            dashboardCode: dashboard.code,
            entityType: entity.type,
            entityCode: entity.code,
            entityName: entity.name,
            items: Object.values(filteredDashboardItems).map(item => ({
              code: item.code,
              legacy: item.legacy,
              reportCode: item.report_code,
              ...item.config,
            })),
          };
        }),
      )
    ).filter(d => d !== null);
  };

  getStaticDashboard = async (entity, staticDashboardItem) => {
    const noDataAtLevelDashboardItem = await this.models.dashboardItem.findOne({
      code: staticDashboardItem,
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
            code: noDataAtLevelDashboardItem.code,
            legacy: noDataAtLevelDashboardItem.legacy,
            reportCode: noDataAtLevelDashboardItem.report_code,
            ...noDataAtLevelDashboardItem.config,
          },
        ],
      },
    ];
  };
}
