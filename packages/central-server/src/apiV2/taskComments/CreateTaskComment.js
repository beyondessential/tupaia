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
    const user = await this.models.user.findById(userId); // Check if user exists
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }

    const { user_full_name: userFullName } = user;
    this.newRecordData.user_id = userId;
    this.newRecordData.user_name = userFullName;

    return this.insertRecord();
  }
}
