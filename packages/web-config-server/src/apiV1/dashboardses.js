/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { RouteHandler } from './RouteHandler';
import { NoPermissionRequiredChecker } from './permissions';

const sortByDbColumns = (array, columns) => {
  // Sorts an array of objects by properties in a prioritized order
  let sortedOutput = [];
  columns.forEach(columnName => {
    sortedOutput = sortedOutput.concat(array
      .filter(item => !!item[columnName])
      .sort((itemA, itemB) => itemA[columnName] > itemB[columnName] ? 1 : -1));
    array = array.filter(item => !item[columnName]);
  });
  return [...sortedOutput, ...array];
}

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
    const sortedDashboards = sortByDbColumns(dashboards, ['sort_order', 'name']);
    // Fetch dashboard items
    await Promise.all(
      Object.values(sortedDashboards).map(async (dashboard, index) => {
        const dashboardItems = await this.models.dashboardItem.fetchItemsInDashboard(
          dashboard.id,
          userGroups,
        );
        const sortedDashboardItems = sortByDbColumns(dashboardItems, ['sort_order', 'code']);
        returnArray[index] = {
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
    return returnArray;
  };
}
