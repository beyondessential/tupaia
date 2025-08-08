import { EditHandler } from '../EditHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertUserCanEditTask } from './assertTaskPermissions';

export class EditTask extends EditHandler {
  async assertUserHasAccess() {
    const permissionChecker = accessPolicy =>
      assertUserCanEditTask(accessPolicy, this.models, this.recordId, this.updatedFields);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, permissionChecker]));
  }

  async editRecord() {
    return this.models.task.updateById(this.recordId, this.updatedFields, this.req.user.id);
  }
}
