/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import {
  assertAdminPanelAccess,
  assertAllPermissions,
  assertAnyPermissions,
  assertBESAdminAccess,
} from '../../permissions';
import { EditHandler } from '../EditHandler';

const assertEntityHierarchyEditPermissions = async (accessPolicy, models, entityHierarchyId) => {
  const projects = await models.project.getAccessibleProjects(accessPolicy);
  const project = projects.find(p => p.entity_hierarchy_id === entityHierarchyId);
  if (!project) {
    throw new Error(`No access to hierarchy with id ${entityHierarchyId}`);
  }
  return true;
};

export class EditEntityHierarchy extends EditHandler {
  async editRecord() {
    await this.updateRecord();
  }

  async assertUserHasAccess() {
    const entityHierarchyPermissionsChecker = accessPolicy =>
      assertAllPermissions([
        assertAdminPanelAccess,
        assertEntityHierarchyEditPermissions(accessPolicy, this.models, this.recordId),
      ]);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, entityHierarchyPermissionsChecker]),
    );
  }
}
