import { isNotNullish } from '@tupaia/tsutils';
import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class DashboardRelationRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DASHBOARD_RELATION;

  static joins = /** @type {const} */ ([
    {
      fields: {
        code: 'dashboard_code',
      },
      joinWith: RECORDS.DASHBOARD,
      joinCondition: ['dashboard.id', 'dashboard_relation.dashboard_id'],
    },
    {
      fields: {
        code: 'dashboard_item_code',
      },
      joinWith: RECORDS.DASHBOARD_ITEM,
      joinCondition: ['dashboard_item.id', 'dashboard_relation.child_id'],
    },
  ]);

  async attributesFilterMatchesEntity(entity) {
    const { attributes_filter: attributesFilter } = this;

    if (!attributesFilter || !Object.keys(attributesFilter).length) return true;

    const attributesDbFilter = Object.entries(attributesFilter).reduce((result, [key, value]) => {
      return {
        ...result,
        [`attributes->>${key}`]: value,
      };
    }, {});

    const filteredEntity = await this.otherModels.entity.findOne({
      id: entity.id,
      ...attributesDbFilter,
    });

    return isNotNullish(filteredEntity);
  }
}

export class DashboardRelationModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return DashboardRelationRecord;
  }

  customColumnSelectors = {
    // `entity_types` is enum[] in the DB, which doesn't get parsed into a JS array automatically
    entity_types: () => ({ castAs: 'text[]' }),
  };

  async findDashboardRelation(dashboardCode, dashboardItemCode) {
    return this.findOne(
      {
        'dashboard.code': dashboardCode,
        'dashboard_item.code': dashboardItemCode,
      },
      {
        multiJoin: [
          {
            joinWith: RECORDS.DASHBOARD,
            joinCondition: ['dashboard.id', 'dashboard_relation.dashboard_id'],
          },
          {
            joinWith: RECORDS.DASHBOARD_ITEM,
            joinCondition: ['dashboard_item.id', 'dashboard_relation.child_id'],
          },
        ],
      },
    );
  }

  /**
   *
   * @param {string[]} dashboardIds
   * @param {string} entityCode
   * @param {string} projectCode
   *
   * @description Filters the dashboard relations to only include those that are relevant to the given dashboardIds, entityCode and projectCodes, and also filters out relations that don't match the root entity's attributes
   */
  async findDashboardRelationsForEntityAndProject(dashboardIds, entityCode, projectCode) {
    if (!dashboardIds || !dashboardIds.length) throw new Error('Dashboard IDs are required');
    if (!entityCode) throw new Error('Entity code is required');
    if (!projectCode) throw new Error('Project code is required');

    const rootEntity = await this.otherModels.entity.findOne({ code: entityCode });

    if (!rootEntity) throw new Error(`Entity with code '${entityCode}' not found`);

    const dashboardRelations = await this.find({
      // Attached to the given dashboards
      dashboard_id: dashboardIds,
      // For the root entity type
      entity_types: {
        comparator: '@>',
        comparisonValue: [rootEntity.type],
      },
      // Within the selected project
      project_codes: {
        comparator: '@>',
        comparisonValue: [projectCode],
      },
    });

    // Filter out relations that don't match the root entity's attributes
    // Because the attributesFilterMatchesEntity method is async, we need to use Promise.all to wait for all the promises to resolve, and then filter out the null values, otherwise the result is an array of promises, which is an array of all truthy values and gives us false positives
    return Promise.all(
      dashboardRelations.map(async relation => {
        const entityMatchesFilter = await relation.attributesFilterMatchesEntity(rootEntity);
        return entityMatchesFilter ? relation : null;
      }),
    ).then(relations => relations.filter(isNotNullish));
  }
}
