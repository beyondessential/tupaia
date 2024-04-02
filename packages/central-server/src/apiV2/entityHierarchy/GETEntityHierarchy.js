/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import {
  assertAdminPanelAccess,
  assertAnyPermissions,
  assertBESAdminAccess,
  hasBESAdminAccess,
  hasTupaiaAdminPanelAccess,
} from '../../permissions';
import { GETHandler } from '../GETHandler';
import { mergeFilter } from '../utilities';

const assertHierarchyPermissions = async (accessPolicy, models, entityHierarchyId) => {
  const error = new Error(
    `Need Tupaia Admin Panel access to hierarchy with id: '${entityHierarchyId}'`,
  );
  if (!hasTupaiaAdminPanelAccess(accessPolicy)) {
    throw error;
  }
  // find the project that has the entity hierarchy id in the user's accessible projects
  const projects = await models.project.getAccessibleProjects(accessPolicy);

  const project = projects.find(p => p.entity_hierarchy_id === entityHierarchyId);

  // if the project is not accessible to the user, throw an error
  if (!project) {
    throw error;
  }

  return true;
};

export class GETEntityHierarchy extends GETHandler {
  permissionsFilteredInternally = true;

  async assertUserHasAccess() {
    // If this is a single record request, check the user has access to the entity hierarchy
    if (this.recordId) {
      const projectPermissionsChecker = accessPolicy =>
        assertHierarchyPermissions(accessPolicy, this.models, this.recordId);

      await this.assertPermissions(
        assertAnyPermissions([assertBESAdminAccess, projectPermissionsChecker]),
      );
    }

    // Otherwise, check the user has access to the admin panel or is a BES admin
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, assertAdminPanelAccess]),
    );
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = { ...criteria };

    if (!hasBESAdminAccess(this.accessPolicy)) {
      const accessibleProjects = await this.models.project.getAccessibleProjects(this.accessPolicy);
      dbConditions.id = mergeFilter(
        accessibleProjects.map(project => project.entity_hierarchy_id),
        dbConditions.id,
      );
    }

    return { dbConditions, dbOptions: options };
  }
}
