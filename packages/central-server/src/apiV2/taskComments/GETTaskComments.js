/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { GETHandler } from '../GETHandler';
import { assertUserHasTaskPermissions } from '../tasks/assertTaskPermissions';
import { createTaskCommentDBFilter } from './assertTaskCommentPermissions';

/**
 * Handles endpoints:
 * - /tasks/:taskId/comments
 */

export class GETTaskComments extends GETHandler {
  permissionsFilteredInternally = true;

  async getPermissionsFilter(criteria, options) {
    return createTaskCommentDBFilter(this.accessPolicy, this.models, criteria, options);
  }

  async getPermissionsViaParentFilter(criteria, options) {
    const taskPermissionsChecker = accessPolicy =>
      assertUserHasTaskPermissions(accessPolicy, this.models, this.parentRecordId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, taskPermissionsChecker]),
    );
    // Filter by parent
    const dbConditions = { 'task_comment.task_id': this.parentRecordId, ...criteria };

    // Apply regular permissions
    return {
      dbConditions,
      dbOptions: options,
    };
  }
}
