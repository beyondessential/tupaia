import { SyncDirections } from '@tupaia/constants';
import { hasBESAdminAccess } from '@tupaia/access-policy';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { buildSyncLookupSelect } from '../sync';

export class TaskCommentRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.TASK_COMMENT;
}

export class TaskCommentModel extends DatabaseModel {
  static syncDirection = SyncDirections.BIDIRECTIONAL;

  get DatabaseRecordClass() {
    return TaskCommentRecord;
  }

  async createRecordsPermissionFilter(accessPolicy, criteria = {}, options = {}) {
    if (hasBESAdminAccess(accessPolicy)) {
      return { dbConditions: criteria, dbOptions: options };
    }

    const taskCommentDbConditions = { ...criteria };
    const taskCommentDbOptions = { ...options };

    const { dbConditions: taskDbConditions } =
      await this.otherModels.task.createRecordsPermissionFilter(accessPolicy);

    const taskIds = await this.otherModels.task.find(
      {
        ...taskDbConditions,
        id: taskCommentDbConditions.task_id ?? undefined,
      },
      { columns: ['task.id'] },
    );

    if (!taskIds.length) {
      // if the user doesn't have access to any tasks, return a condition that will return no results
      return { dbConditions: { id: -1 }, dbOptions: options };
    }

    return {
      dbConditions: {
        ...taskCommentDbConditions,
        task_id: {
          comparator: 'IN',
          comparisonValue: taskIds.map(task => task.id), // this will include any task_id filters because the list of tasks was already filtered by the dbConditions
        },
      },
      dbOptions: taskCommentDbOptions,
    };
  }

  async buildSyncLookupQueryDetails() {
    return {
      select: await buildSyncLookupSelect(this, {
        projectIds: `array_remove(ARRAY[survey.project_id], NULL)`,
      }),
      joins: `
        LEFT JOIN task ON task.id = task_comment.task_id
        LEFT JOIN survey ON survey.id = task.survey_id
      `,
    };
  }

  types = {
    System: 'system',
    User: 'user',
  };

  systemCommentTypes = {
    Create: 'create',
    Update: 'update',
    Complete: 'complete',
    Overdue: 'overdue',
  };
}
