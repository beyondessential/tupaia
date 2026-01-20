import { Task } from '@tupaia/types';
import { ensure } from '@tupaia/tsutils';

import { DatatrakWebModelRegistry } from '../../types';

type PartialTask = Partial<Task>;

export const editTask = async ({
  models,
  taskId,
  data,
}: {
  models: DatatrakWebModelRegistry;
  taskId?: Task['id'];
  data: PartialTask;
}) => {
  const ensuredTaskId = ensure(taskId);
  const originalTask = ensure(await models.task.findById(ensuredTaskId));
  const formattedData = models.task.formatTaskChanges(data, originalTask);
  return await models.task.updateById(ensuredTaskId, formattedData);
};
