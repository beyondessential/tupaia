/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
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
    await this.models.wrapInTransaction(async transactingModels => {
      const task = await transactingModels.task.create(this.newRecordData);
      await task.addComment('Created this task', this.req.user.id, 'system');
      return {
        id: task.id,
      };
    });
  }
}
