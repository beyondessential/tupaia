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

    try {
      await this.createProjectEntity(code, name);
      await this.createEntityHierarchy(code, entityTypes);
      await this.createProjectEntityRelations(code, countries);
      await this.createProjectDashboard(dashboard_group_name, code);

      const { id: projectEntityId } = await this.models.entity.findOne({ 'entity.code': code });
      const { id: projectEntityHierarchyId } = await this.models.entityHierarchy.findOne({
        'entity_hierarchy.name': code,
      });

      const { name: dashboardGroupName } = await this.models.dashboard.findOne({
        'dashboard.root_entity_code': code,
      });

      await this.models.project.create({
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
    } catch (error) {
      await this.rollbackRecords(code);
      throw new DatabaseError('Creating project record', error);
    }
  }

  async rollbackRecords(projectCode) {
    await this.models.project.delete({ code: projectCode });
    await this.models.dashboard.delete({ root_entity_code: projectCode });
    const projectEntity = await this.models.entity.findOne({
      code: projectCode,
      type: 'project',
    });
    if (projectEntity !== null) {
      await this.models.entityRelation.delete({ parent_id: projectEntity.id });
      await this.models.entity.delete({ id: projectEntity.id });
    }
    await this.models.entityHierarchy.delete({ name: projectCode });
  }

  async createProjectEntity(code, name) {
    const worldCode = 'World';
    const { id: worldId } = await this.models.entity.findOne({ 'entity.code': worldCode });

    await this.models.entity.create({
      name,
      code,
      parent_id: worldId,
      type: 'project',
    });
  }

  async createProjectEntityRelations(code, countries) {
    const { id: projectEntityId } = await this.models.entity.findOne({
      'entity.code': code,
    });
    const { id: entityHierarchyId } = await this.models.entityHierarchy.findOne({
      'entity_hierarchy.name': code,
    });

    for (const countryId of countries) {
      const { code: countryCode } = await this.models.country.findOne({
        'country.id': countryId,
      });
      const { id: entityId } = await this.models.entity.findOne({
        'entity.code': countryCode,
        'entity.type': 'country',
      });
      await this.models.entityRelation.create({
        parent_id: projectEntityId,
        child_id: entityId,
        entity_hierarchy_id: entityHierarchyId,
      });
    }
  }

  async createProjectDashboard(dashboard_group_name, code) {
    await this.models.dashboard.create({
      code: `${code}_project`,
      name: dashboard_group_name,
      root_entity_code: code,
    });
  }

  async createEntityHierarchy(code, entityTypes) {
    await this.models.entityHierarchy.create({
      name: code,
      canonical_types: entityTypes ? `{${entityTypes.join(',')}}` : '{}',
    });
  }
}
