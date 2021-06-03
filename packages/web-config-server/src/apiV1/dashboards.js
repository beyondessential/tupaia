/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import orderBy from 'lodash.orderby';
import { RouteHandler } from './RouteHandler';
import { NoPermissionRequiredChecker } from './permissions';

export default class extends RouteHandler {
  static PermissionsChecker = NoPermissionRequiredChecker;

  buildResponse = async () => {
    const { entity, query } = this;
    const { code: entityCode } = entity;
    const permissionGroups = await this.req.getUserGroups(entityCode);
    const hierarchyId = await this.fetchHierarchyId();
    // Fetch dashboards
    const dashboards = await this.models.dashboard.getDashboards(
      entity,
      hierarchyId,
      query.projectCode,
    );
    const sortedDashboards = orderBy(dashboards, ['sort_order', 'name']);
    // Fetch dashboard items
    const dashboardsWithItems = await Promise.all(
      Object.values(sortedDashboards).map(async dashboard => {
        const dashboardItems = await this.models.dashboardItem.fetchItemsInDashboard(
          dashboard.id,
          permissionGroups,
        );
        const sortedDashboardItems = orderBy(dashboardItems, ['sort_order', 'code']);
        return {
          dashboardName: dashboard.name,
          dashboardId: dashboard.id,
          dashboardCode: dashboard.code,
          entityType: entity.type,
          entityCode,
          entityName: entity.name,
          items: Object.values(sortedDashboardItems).map(item => ({
            itemCode: item.code,
            legacy: item.legacy,
            reportCode: item.report_code,
            ...item.config,
          })),
        };
      }),
    );
    return dashboardsWithItems;
  };
}
