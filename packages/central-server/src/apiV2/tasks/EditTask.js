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
    const originalRecord = await this.models.task.findById(this.recordId);

    return this.models.wrapInTransaction(async transactingModels => {
      const taskRecord = await transactingModels.task.findById(this.recordId);
      if (comment) {
        await taskRecord.addComment(comment, this.req.user.id, 'user');
      }
      await originalRecord.addSystemCommentsOnUpdate(this.updatedFields, this.req.user.id);
      // an edit can be just a comment, so we need to check if there are any other fields to update before calling updateById so we don't get an error
      if (Object.keys(updatedFields).length > 0) {
        return transactingModels.task.updateById(this.recordId, updatedFields);
      }
      return taskRecord;
    });
  }
}
