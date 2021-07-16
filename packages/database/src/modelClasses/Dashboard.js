/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class DashboardType extends DatabaseType {
  static databaseType = TYPES.DASHBOARD;
}

export class DashboardModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DashboardType;
  }

  async getDashboards(entity, hierarchyId, params) {
    const ancestorCodes = await entity.getAncestorCodes(hierarchyId);
    const entityCodes = [...ancestorCodes, entity.code];
    return this.find({
      root_entity_code: entityCodes,
      ...params,
    });
  }

  /**
   * Return an object with a list of dashboards as values keyed
   * by the dashboardItemId that the dashboards contain.
   *
   * {
   *  'dashboardItem1': [{dashboardObject1}, {dashboardObject2}]
   * }
   */
  async findDashboardsWithRelationsByItemIds(dashboardItemIds) {
    const dashboards = await this.database.find(
      this.databaseType,
      {
        [`${TYPES.DASHBOARD_RELATION}.child_id`]: dashboardItemIds,
      },
      {
        columns: [
          { id: `${TYPES.DASHBOARD}.id` },
          { code: `${TYPES.DASHBOARD}.code` },
          { name: `${TYPES.DASHBOARD}.name` },
          { rootEntityCode: `${TYPES.DASHBOARD}.root_entity_code` },
          { itemId: `${TYPES.DASHBOARD_RELATION}.child_id` },
          {
            permissionGroups: `${TYPES.DASHBOARD_RELATION}.permission_groups`,
          },
          {
            entityTypes: `${TYPES.DASHBOARD_RELATION}.entity_types`,
          },

          { projectCodes: `${TYPES.DASHBOARD_RELATION}.project_codes` },
        ],
        joinWith: TYPES.DASHBOARD_RELATION,
        joinCondition: [`${TYPES.DASHBOARD_RELATION}.dashboard_id`, `${TYPES.DASHBOARD}.id`],
        sort: [`${TYPES.DASHBOARD_RELATION}.sort_order`],
      },
    );

    const dashboardsByItemIds = {};

    dashboardItemIds.forEach(dashboardItemId => {
      dashboardsByItemIds[dashboardItemId] = dashboards.filter(
        dashboard => dashboard.itemId === dashboardItemId,
      );
    });

    return dashboardsByItemIds;
  }

  /**
   * Return a list of dashboards that a dashboard item belong to
   *
   * @param {*} dashboardItemId
   * @returns
   */
  async findDashboardsWithRelationsByItemId(dashboardItemId) {
    const dashboardsByItemIds = await this.findDashboardsWithRelationsByItemIds([dashboardItemId]);
    return dashboardsByItemIds[dashboardItemId];
  }
}
