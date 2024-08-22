/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { CreateHandler } from '../CreateHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertUserHasTaskPermissions } from '../tasks/assertTaskPermissions';
/**
 * Handles POST endpoints:
 * - /tasks/:parentRecordId/taskComments
 */

export class CreateTaskComment extends CreateHandler {
  async assertUserHasAccess() {
    const createPermissionChecker = accessPolicy =>
      assertUserHasTaskPermissions(accessPolicy, this.models, this.parentRecordId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, createPermissionChecker]),
    );
  }

  async createRecord() {
    return this.models.wrapInTransaction(async transactingModels => {
      const task = await transactingModels.task.findById(this.parentRecordId);
      const { message, type, templateVariables } = this.newRecordData;
      const newComment = await task.addComment({
        message,
        userId: this.req.user.id,
        type,
        templateVariables,
      });
      return { id: newComment.id };
    });
  }
}
