import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { EditHandler } from '../EditHandler';

const assertEntityHierarchyEditPermissions = async (accessPolicy, models, entityHierarchyId) => {
  const project = await models.project.findOne({ entity_hierarchy_id: entityHierarchyId });
  if (!project) {
    throw new Error(`No project found with entity hierarchy id: '${entityHierarchyId}'`);
  }
  const error = new Error(
    `Need Tupaia Admin Panel access to project with hierarchy id: '${entityHierarchyId}'`,
  );
  const hasAdminAccess = await project.hasAdminAccess(accessPolicy);
  if (!hasAdminAccess) {
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
