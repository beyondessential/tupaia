/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { GETHandler } from '../GETHandler';
import { assertUserHasTaskPermissions, createTaskDBFilter } from './assertTaskPermissions';

export class GETTasks extends GETHandler {
  permissionsFilteredInternally = true;

  customJoinConditions = {
    entity: {
      nearTableKey: 'task.entity_id',
      farTableKey: 'entity.id',
    },
    survey: {
      nearTableKey: 'task.survey_id',
      farTableKey: 'survey.id',
    },
    user_account: {
      nearTableKey: 'task.assignee_id',
      farTableKey: 'user_account.id',
    },
  };

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
}
