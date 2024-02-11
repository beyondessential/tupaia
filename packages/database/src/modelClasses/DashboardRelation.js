/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class DashboardRelationType extends DatabaseType {
  static databaseType = TYPES.DASHBOARD_RELATION;

  static joins = [
    {
      fields: {
        code: 'dashboard_code',
      },
      joinWith: TYPES.DASHBOARD,
      joinCondition: ['dashboard.id', 'dashboard_relation.dashboard_id'],
    },
    {
      fields: {
        code: 'dashboard_item_code',
      },
      joinWith: TYPES.DASHBOARD_ITEM,
      joinCondition: ['dashboard_item.id', 'dashboard_relation.child_id'],
    },
  ];
}

const assertRelationAttributesMatchEntity = (entityAttribute, attributeFilter) => {
  if (!attributeFilter) return true;
  const comparisonValue = (
    Array.isArray(attributeFilter) ? attributeFilter : [attributeFilter]
  ).map(v => String(v).toLowerCase());

  const entityValue = entityAttribute?.toLowerCase() ?? undefined;

  return comparisonValue.some(v => {
    if (v === 'no') {
      return entityValue === 'no' || !entityAttribute;
    }
    return v === entityValue;
  });
};

const filterByAttributes = (entity, relation) => {
  if (!relation.attributes_filter || !Object.keys(relation.attributes_filter).length) return true;
  return Object.entries(relation.attributes_filter).every(([key, value]) => {
    return assertRelationAttributesMatchEntity(entity.attributes?.[key], value);
  });
};

export class DashboardRelationModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DashboardRelationType;
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
            joinWith: TYPES.DASHBOARD,
            joinCondition: ['dashboard.id', 'dashboard_relation.dashboard_id'],
          },
          {
            joinWith: TYPES.DASHBOARD_ITEM,
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
    return dashboardRelations.filter(relation => filterByAttributes(rootEntity, relation));
  }
}
