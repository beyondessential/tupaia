/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { GETHandler } from '../GETHandler';
import { assertUserHasTaskPermissions, createTaskDBFilter } from './assertTaskPermissions';

export class GETTasks extends GETHandler {
  permissionsFilteredInternally = true;

  async getPermissionsFilter(criteria, options) {
    return createTaskDBFilter(this.accessPolicy, this.models, criteria, options);
  }

  async findSingleRecord(projectId, options) {
    const taskPermissionChecker = accessPolicy =>
      assertUserHasTaskPermissions(accessPolicy, this.models, projectId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, taskPermissionChecker]),
    );

    return super.findSingleRecord(projectId, options);
  }

  async getDbQueryOptions() {
    const { multiJoin, sort, ...restOfOptions } = await super.getDbQueryOptions();

    return {
      ...restOfOptions,
      // Strip table prefix from `task_status` and `assignee_name` as these are customColumns
      sort: sort.map(s =>
        s.replace('task.task_status', 'task_status').replace('task.assignee_name', 'assignee_name'),
      ),
      // Appending the multi-join from the Record class so that we can fetch the `task_status` and `assignee_name`
      multiJoin: multiJoin.concat(this.models.task.DatabaseRecordClass.joins),
    };
  }
}