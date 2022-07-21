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
      code,
      name,
      description,
      sort_order,
      image_url,
      logo_url,
      permission_groups,
      countries,
      entityTypes,
    } = this.newRecordData;

    await this.createProjectEntity(code, name);
    await this.createEntityHierarchy(code, entityTypes);
    await this.createProjectEntityRelations(code, countries);
    await this.createProjectDashboard(name, code);

    const [projectEntity] = await this.models.database.find('entity', { 'entity.code': code });
    const [projectEntityHierarchy] = await this.models.database.find('entity_hierarchy', {
      'entity_hierarchy.name': code,
    });
    const defaultMapOverlayCode = '126';
    const [dashboardGroup] = await this.database.find('dashboard', {
      'dashboard.root_entity_code': code,
    });

    await this.models.project.create({
      code,
      description,
      sort_order,
      image_url,
      logo_url,
      permission_groups,
      default_measure: defaultMapOverlayCode,
      dashboard_group_name: dashboardGroup.name,
      entity_id: projectEntity.id,
      entity_hierarchy_id: projectEntityHierarchy.id,
    });
  }

  async createProjectEntity(code, name) {
    const worldCode = 'World';
    const [world] = await this.models.database.find('entity', { 'entity.code': worldCode });

    await this.models.entity.create({
      name,
      code,
      parent_id: world.id,
      type: 'project',
    });
  }

  async createProjectEntityRelations(code, countries) {
    const [projectEntity] = await this.models.database.find('entity', { 'entity.code': code });
    const [entityHierarchy] = await this.models.database.find('entity_hierarchy', {
      'entity_hierarchy.name': code,
    });

    for (const countryId of countries) {
      const [country] = await this.models.database.find('country', {
        'country.id': countryId,
      });
      const [entity] = await this.models.database.find('entity', {
        'entity.code': country.code,
        'entity.type': 'country',
      });
      await this.models.entityRelation.create({
        parent_id: projectEntity.id,
        child_id: entity.id,
        entity_hierarchy_id: entityHierarchy.id,
      });
    }
  }

  async createProjectDashboard(name, code) {
    await this.models.dashboard.create({
      code: `${code}_project`,
      name,
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
