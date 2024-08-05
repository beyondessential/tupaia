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
    return this.models.wrapInTransaction(async transactingModels => {
      const originalTask = await transactingModels.task.findById(this.recordId);
      const task = await transactingModels.task.updateById(this.recordId, this.updatedFields);

      await originalTask.addSystemCommentsOnUpdate(this.updatedFields, this.req.user.id);
      return task;
    });
  }
}
