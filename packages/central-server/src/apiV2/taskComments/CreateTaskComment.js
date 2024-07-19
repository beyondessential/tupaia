/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { CreateHandler } from '../CreateHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertUserHasPermissionToCreateTaskComment } from './assertTaskCommentPermissions';
/**
 * Handles POST endpoints:
 * - /taskComments
 */

export class CreateTaskComment extends CreateHandler {
  async assertUserHasAccess() {
    const createPermissionChecker = accessPolicy =>
      assertUserHasPermissionToCreateTaskComment(accessPolicy, this.models, this.newRecordData);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, createPermissionChecker]),
    );
  }

  async createRecord() {
    const { id: userId } = this.req.user;
    const { task_id: taskId, ...restOfTaskComment } = this.newRecordData;
    await this.models.wrapInTransaction(async transactingModels => {
      const user = await transactingModels.user.findById(userId); // Check if user exists
      if (!user) {
        throw new Error(`User with id ${userId} not found`);
      }

      const { user_full_name: userFullName } = user;
    });
  }
}
