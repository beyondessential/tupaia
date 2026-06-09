import { camelcaseKeys, ensure } from '@tupaia/tsutils';
import { DatatrakWebTasksRequest } from '@tupaia/types';
import { SINGLE_TASK_QUERY_FIELDS } from '@tupaia/constants';
import { processColumns, RECORDS } from '@tupaia/database';

import { UseTaskLocalContext } from '../../api/queries/useTask';

export const getTask = async ({ models, taskId }: UseTaskLocalContext) => {
  // Need to use database.findOne instead of task.findById
  // because we need some extra columns from extra joined tables
  const taskRecord = await models.database.findOne(
    RECORDS.TASK,
    { [`${RECORDS.TASK}.id`]: ensure(taskId) },
    {
      columns: processColumns(models, SINGLE_TASK_QUERY_FIELDS, RECORDS.TASK),
      multiJoin: models.task.DatabaseRecordClass.joins,
    },
  );
  const formattedTask = await models.task.formatTaskForClient(
    taskRecord as unknown as DatatrakWebTasksRequest.RawTaskResult,
  );

  const taskComments = await models.taskComment.find(
    {
      task_id: ensure(taskId),
    },
    {
      sort: ['created_at DESC'],
    },
  );

  const formattedComments = camelcaseKeys(
    taskComments.map(({ model: _, ...comment }) => ({
      ...comment,
      createdAt: comment.created_at.toISOString(),
    })),
    { deep: true },
  );

  return {
    ...formattedTask,
    comments: formattedComments,
  };
};
