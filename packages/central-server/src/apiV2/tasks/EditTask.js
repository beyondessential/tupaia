/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

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
    const { comment, ...updatedFields } = this.updatedFields;
    return this.models.wrapInTransaction(async transactingModels => {
      const originalTask = await transactingModels.task.findById(this.recordId);
      let task = originalTask;
      // Sometimes an update can just be a comment, so we don't want to update the task if there are no fields to update, because we would get an error
      if (Object.keys(updatedFields).length > 0) {
        task = await transactingModels.task.updateById(this.recordId, updatedFields);
      }
      if (comment) {
        await originalTask.addComment(comment, this.req.user.id);
      }
      return task;
    });
  }
}
