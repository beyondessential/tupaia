import { CreateHandler } from '../CreateHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertUserHasPermissionToCreateTask } from './assertTaskPermissions';
/**
 * Handles POST endpoints:
 * - /tasks
 */

export class CreateTask extends CreateHandler {
  async assertUserHasAccess() {
    const createPermissionChecker = accessPolicy =>
      assertUserHasPermissionToCreateTask(accessPolicy, this.models, this.newRecordData);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, createPermissionChecker]),
    );
  }

  async createRecord() {
    const { comment, ...newRecordData } = this.newRecordData;
    await this.models.wrapInTransaction(async transactingModels => {
      const task = await transactingModels.task.create(newRecordData, this.req.user.id);
      // Add the user comment first, since the transaction will mean that all comments have the same created_at time, but we want the user comment to be the 'most recent'
      if (comment) {
        await task.addUserComment(comment, this.req.user.id);
      }

      return {
        id: task.id,
      };
    });
  }
}
