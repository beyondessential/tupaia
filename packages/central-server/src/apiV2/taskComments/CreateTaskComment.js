/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { RECORDS } from '@tupaia/database';
import { CreateHandler } from '../CreateHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertUserHasTaskPermissions } from '../tasks/assertTaskPermissions';

/**
 * Handles POST endpoints:
 * - /tasks/:parentRecordId/taskComments
 */

export class CreateTaskComment extends CreateHandler {
  parentRecordType = RECORDS.TASK;

  async assertUserHasAccess() {
    const createPermissionChecker = accessPolicy =>
      assertUserHasTaskPermissions(accessPolicy, this.models, this.parentRecordId);

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

    const { full_name: userFullName } = user;
    this.newRecordData.user_id = userId;
    this.newRecordData.user_name = userFullName;
    this.newRecordData.task_id = this.parentRecordId;

    return this.insertRecord();
  }
}
