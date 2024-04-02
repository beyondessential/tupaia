/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { assertAnyPermissions, assertBESAdminAccess, hasBESAdminAccess } from '../../permissions';
import { TupaiaAdminGETHandler } from '../GETHandler';
import { mergeFilter } from '../utilities';

const assertHierarchyPermissions = async (accessPolicy, models, entityHierarchyId) => {
  // find the project that has the entity hierarchy id in the user's accessible projects
  const projects = await models.project.getAccessibleProjects(accessPolicy);

  const project = projects.find(p => p.entity_hierarchy_id === entityHierarchyId);

  // if the project is not accessible to the user, throw an error
  if (!project) {
    throw new Error(`No access to hierarchy with id ${entityHierarchyId}`);
  }

  return true;
};

export class GETEntityHierarchy extends TupaiaAdminGETHandler {
  permissionsFilteredInternally = true;

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

  async findSingleRecord(entityHierarchyId, options) {
    const projectPermissionsChecker = accessPolicy =>
      assertHierarchyPermissions(accessPolicy, this.models, entityHierarchyId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, projectPermissionsChecker]),
    );

    return super.findSingleRecord(entityHierarchyId, options);
  }
}
