/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

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
      code: projectCode,
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
      const { id: projectEntityId } = await this.createProjectEntity(
        transactingModels,
        projectCode,
        name,
      );

      const { id: projectEntityHierarchyId } = await this.createEntityHierarchy(
        transactingModels,
        projectCode,
        entityTypes,
      );

      await this.createProjectEntityRelations(transactingModels, projectCode, countries);
      const { name: dashboardGroupName } = await this.createProjectDashboard(
        transactingModels,
        dashboard_group_name,
        projectCode,
      );

      return transactingModels.project.create({
        code: projectCode,
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

  async createProjectEntity(models, projectCode, name) {
    const worldCode = 'World';
    const { id: worldId } = await models.entity.findOne({ code: worldCode });

    return models.entity.create({
      name,
      code: projectCode,
      parent_id: worldId,
      type: 'project',
    });
  }

  async createProjectEntityRelations(models, projectCode, countries) {
    const { id: projectEntityId } = await models.entity.findOne({
      code: projectCode,
    });
    const { id: entityHierarchyId } = await models.entityHierarchy.findOne({
      name: projectCode,
    });

    for (const countryId of countries) {
      const { code: countryCode } = await models.country.findOne({
        id: countryId,
      });
      const { id: entityId } = await models.entity.findOne({
        code: countryCode,
        type: 'country',
      });
      await models.entityRelation.create({
        parent_id: projectEntityId,
        child_id: entityId,
        entity_hierarchy_id: entityHierarchyId,
      });
    }
  }

  async createProjectDashboard(models, dashboard_group_name, projectCode) {
    return models.dashboard.create({
      code: `${projectCode}_project`,
      name: dashboard_group_name,
      root_entity_code: projectCode,
    });
  }

  async createEntityHierarchy(models, projectCode, entityTypes) {
    return models.entityHierarchy.create({
      name: projectCode,
      canonical_types: entityTypes ? `{${entityTypes.join(',')}}` : '{}',
    });
  }
}
