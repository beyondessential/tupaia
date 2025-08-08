import { CreateHandler } from '../CreateHandler';
import {
  assertAdminPanelAccess,
  assertAnyPermissions,
  assertBESAdminAccess,
} from '../../permissions';

// If the user tries to create a permission group with a parent_id, we need to check if the user has access to the parent permission group. If the user does not have access to the parent permission group, we should throw an error.
const assertUserHasAccessToParentPermissionGroup = async (accessPolicy, models, parentId) => {
  assertAdminPanelAccess(accessPolicy);
  if (!parentId) throw new Error('Parent permission group is required');
  const permissionGroup = await models.permissionGroup.findOne({ id: parentId });
  if (!permissionGroup) {
    throw new Error(`Parent permission group with id '${parentId}' not found`);
  }
  if (!accessPolicy.allowsAnywhere(permissionGroup.name)) {
    throw new Error('Need Tupaia Admin Panel access to the parent permission group');
  }
  return true;
};

export class CreatePermissionGroup extends CreateHandler {
  async assertUserHasAccess() {
    const parentPermissionGroupChecker = async accessPolicy =>
      assertUserHasAccessToParentPermissionGroup(
        accessPolicy,
        this.models,
        this.req.body.parent_id,
      );

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, parentPermissionGroupChecker]),
    );
  }

  async createRecord() {
    return this.insertRecord();
  }
}
