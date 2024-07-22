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
    const originalRecord = await this.models.task.findById(this.recordId);
    return this.models.wrapInTransaction(async transactingModels => {
      const newRecord = await transactingModels.task.updateById(this.recordId, this.updatedFields);
      await originalRecord.addSystemCommentsOnUpdate(this.updatedFields, this.req.user.id);
      return newRecord;
    });
  }
}
