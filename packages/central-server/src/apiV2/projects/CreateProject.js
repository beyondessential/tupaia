/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseError } from '@tupaia/utils';
import { CreateHandler } from '../CreateHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';

/**
 * Handles POST endpoints:
 * - /projects
 */

export class CreateProject extends CreateHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess], 'You need BES Admin to create new projects'),
    );
  }

  async createRecord() {
    const {
      code,
      name,
      description,
      sort_order,
      image_url,
      logo_url,
      permission_groups,
      countries,
      entityTypes,
      default_measure,
      dashboard_group_name,
    } = this.newRecordData;

    await this.models.wrapInTransaction(async transactingModels => {
      await this.createProjectEntity(transactingModels, code, name);
      await this.createEntityHierarchy(transactingModels, code, entityTypes);
      await this.createProjectEntityRelations(transactingModels, code, countries);
      await this.createProjectDashboard(transactingModels, dashboard_group_name, code);

      const { id: projectEntityId } = await transactingModels.entity.findOne({
        'entity.code': code,
      });
      const { id: projectEntityHierarchyId } = await transactingModels.entityHierarchy.findOne({
        'entity_hierarchy.name': code,
      });

      const { name: dashboardGroupName } = await transactingModels.dashboard.findOne({
        'dashboard.root_entity_code': code,
      });

      return transactingModels.project.create({
        code,
        description,
        sort_order,
        image_url,
        logo_url,
        permission_groups,
        default_measure,
        dashboard_group_name: dashboardGroupName,
        entity_id: projectEntityId,
        entity_hierarchy_id: projectEntityHierarchyId,
      });
    });
  }

  async createProjectEntity(models, code, name) {
    const worldCode = 'World';
    const { id: worldId } = await models.entity.findOne({ 'entity.code': worldCode });

    await models.entity.create({
      name,
      code,
      parent_id: worldId,
      type: 'project',
    });
  }

  async createProjectEntityRelations(models, code, countries) {
    const { id: projectEntityId } = await models.entity.findOne({
      'entity.code': code,
    });
    const { id: entityHierarchyId } = await models.entityHierarchy.findOne({
      'entity_hierarchy.name': code,
    });

    for (const countryId of countries) {
      const { code: countryCode } = await models.country.findOne({
        'country.id': countryId,
      });
      const { id: entityId } = await models.entity.findOne({
        'entity.code': countryCode,
        'entity.type': 'country',
      });
      await models.entityRelation.create({
        parent_id: projectEntityId,
        child_id: entityId,
        entity_hierarchy_id: entityHierarchyId,
      });
    }
  }

  async createProjectDashboard(models, dashboard_group_name, code) {
    await models.dashboard.create({
      code: `${code}_project`,
      name: dashboard_group_name,
      root_entity_code: code,
    });
  }

  async createEntityHierarchy(models, code, entityTypes) {
    await models.entityHierarchy.create({
      name: code,
      canonical_types: entityTypes ? `{${entityTypes.join(',')}}` : '{}',
    });
  }
}
