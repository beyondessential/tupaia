import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { GETHandler } from '../GETHandler';
import { mergeMultiJoin } from '../utilities';
import { assertUserHasTaskPermissions } from './assertTaskPermissions';

export class GETTasks extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  async getPermissionsFilter(criteria, options) {
    return this.models.task.createRecordsPermissionFilter(this.accessPolicy, criteria, options);
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
    const { multiJoin, sort, rawSort, ...restOfOptions } = await super.getDbQueryOptions();

    const options = {
      ...restOfOptions,
      // Appending the multi-join from the Record class so that we can fetch the `task_status` and `assignee_name`
      multiJoin: mergeMultiJoin(multiJoin, this.models.task.DatabaseRecordClass.joins),
    };

    if (rawSort) {
      options.rawSort = rawSort;
    } else {
      // Strip table prefix from `task_status` and `assignee_name` as these are customColumns
      options.sort = sort?.map(s =>
        s.replace('task.task_status', 'task_status').replace('task.assignee_name', 'assignee_name'),
      );
    }

    return options;
  }
}
