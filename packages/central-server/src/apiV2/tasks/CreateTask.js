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
    const recordData = { ...this.newRecordData };
    const { assignee_id: assigneeId } = recordData;
    await this.models.wrapInTransaction(async transactingModels => {
      // Check if assignee exists, and if so, add their name to the record
      if (assigneeId) {
        const user = await transactingModels.user.findById(assigneeId);
        if (!user) {
          throw new Error(`User with id ${assigneeId} not found`);
        }
        const name = [user.first_name, user.last_name].join(' ');
        recordData.assignee_name = name;
      }
      await transactingModels.task.create(recordData);
      return recordData;
    });
  }
}
