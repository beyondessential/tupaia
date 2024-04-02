/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import {
  assertAdminPanelAccess,
  assertAnyPermissions,
  assertBESAdminAccess,
  hasTupaiaAdminPanelAccess,
} from '../../permissions';
import { EditHandler } from '../EditHandler';

const assertEntityHierarchyEditPermissions = async (accessPolicy, models, entityHierarchyId) => {
  const error = new Error(
    `Need Tupaia Admin Panel access to hierarchy with id: '${entityHierarchyId}'`,
  );
  if (!hasTupaiaAdminPanelAccess(accessPolicy)) {
    throw error;
  }

  const projects = await models.project.getAccessibleProjects(accessPolicy);

  const project = projects.find(p => p.entity_hierarchy_id === entityHierarchyId);

  if (!project) {
    throw error;
  }
  return true;
};

export class EditEntityHierarchy extends EditHandler {
  async editRecord() {
    await this.updateRecord();
  }

  async assertUserHasAccess() {
    const entityHierarchyPermissionsChecker = accessPolicy =>
      assertEntityHierarchyEditPermissions(accessPolicy, this.models, this.recordId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, entityHierarchyPermissionsChecker]),
    );
  }
}
