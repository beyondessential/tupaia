/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { GETHandler } from '../GETHandler';
import {
  assertUserHasCommentPermissions,
  createTaskCommentDBFilter,
} from './assertTaskCommentPermissions';

export class GETTaskComments extends GETHandler {
  permissionsFilteredInternally = true;

  async getPermissionsFilter(criteria, options) {
    return createTaskCommentDBFilter(this.accessPolicy, this.models, criteria, options);
  }

  async findSingleRecord(commentId, options) {
    const taskCommentPermissionChecker = accessPolicy =>
      assertUserHasCommentPermissions(accessPolicy, this.models, commentId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, taskCommentPermissionChecker]),
    );

    return super.findSingleRecord(commentId, options);
  }
}
