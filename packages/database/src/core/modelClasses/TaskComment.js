import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class TaskCommentRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.TASK_COMMENT;
}

export class TaskCommentModel extends DatabaseModel {
  syncDirection = SyncDirections.BIDIRECTIONAL;

  get DatabaseRecordClass() {
    return TaskCommentRecord;
  }

  async buildSyncLookupQueryDetails() {
    return {
      select: await buildSyncLookupSelect(this, {
        projectIds: `ARRAY[survey.project_id]`,
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
