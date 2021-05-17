/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { RouteHandler } from './RouteHandler';
import { NoPermissionRequiredChecker } from './permissions';

export default class extends RouteHandler {
  static PermissionsChecker = NoPermissionRequiredChecker;

  buildResponse = async () => {
    const { entity, query } = this;
    const { code: entityCode } = entity;
    const userGroups = await this.req.getUserGroups(entityCode);
    const hierarchyId = await this.fetchHierarchyId();
    const returnArray = [];
    // Fetch dashboards
    const dashboards = await this.models.dashboard.getDashboards(
      entity,
      hierarchyId,
      query.projectCode,
    );
    // Fetch dashboard items
    await Promise.all(
      Object.values(dashboards).map(async (dashboard, index) => {
        const dashboardItems = await this.models.dashboardItem.fetchItemsInDashboard(
          dashboard.id,
          userGroups,
        );
        returnArray[index] = {
          dashboardName: dashboard.name,
          dashboardId: dashboard.id,
          dashboardCode: dashboard.code,
          entityType: entity.type,
          entityCode,
          entityName: entity.name,
          items: Object.values(dashboardItems).map(item => ({
            itemCode: item.code,
            legacy: item.legacy,
            reportCode: item.report_code,
            ...item.config,
          })),
        };
      }),
    );
    return returnArray;
  };
}
