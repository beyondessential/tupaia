import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class DashboardRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DASHBOARD;
}

export class DashboardModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return DashboardRecord;
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
      this.databaseRecord,
      {
        [`${RECORDS.DASHBOARD_RELATION}.child_id`]: dashboardItemIds,
      },
      {
        columns: [
          { id: `${RECORDS.DASHBOARD}.id` },
          { code: `${RECORDS.DASHBOARD}.code` },
          { name: `${RECORDS.DASHBOARD}.name` },
          { rootEntityCode: `${RECORDS.DASHBOARD}.root_entity_code` },
          { itemId: `${RECORDS.DASHBOARD_RELATION}.child_id` },
          {
            permissionGroups: `${RECORDS.DASHBOARD_RELATION}.permission_groups`,
          },
          {
            entityTypes: `${RECORDS.DASHBOARD_RELATION}.entity_types`,
          },

          { projectCodes: `${RECORDS.DASHBOARD_RELATION}.project_codes` },
        ],
        joinWith: RECORDS.DASHBOARD_RELATION,
        joinCondition: [`${RECORDS.DASHBOARD_RELATION}.dashboard_id`, `${RECORDS.DASHBOARD}.id`],
        sort: [`${RECORDS.DASHBOARD_RELATION}.sort_order`],
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
