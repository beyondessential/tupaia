import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { GETHandler } from '../GETHandler';
import { assertUserHasTaskPermissions } from '../tasks/assertTaskPermissions';

/**
 * Handles endpoints:
 * - /tasks/:taskId/comments
 */

export class GETTaskComments extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  async getPermissionsFilter(criteria, options) {
    return await this.models.taskComment.createRecordsPermissionFilter(
      this.accessPolicy,
      criteria,
      options,
    );
  }

  async getPermissionsViaParentFilter(criteria, options) {
    const taskPermissionsChecker = accessPolicy =>
      assertUserHasTaskPermissions(accessPolicy, this.models, this.parentRecordId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, taskPermissionsChecker]),
    );
    // Filter by parent
    const dbConditions = { 'task_comment.task_id': this.parentRecordId, ...criteria };

    // Apply regular permissions
    return {
      dbConditions,
      dbOptions: options,
    };
  }
}
