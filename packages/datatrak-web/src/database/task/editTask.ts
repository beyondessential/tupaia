import { assertIsNotNullish } from '@tupaia/tsutils';
import type { Task } from '@tupaia/types';
import type { CurrentUser } from '../../api/CurrentUserContext';
import type { DatatrakWebModelRegistry } from '../../types';

export const editTask = async ({
  models,
  taskId,
  user,
  data,
}: {
  models: DatatrakWebModelRegistry;
  taskId?: Task['id'];
  user: CurrentUser;
  data: Partial<Task>;
}) => {
  assertIsNotNullish(taskId, 'editTask mutation function called with undefined taskId');
  assertIsNotNullish(user.id, 'editTask mutation function called with undefined user.id');
  const originalTask = await models.task.findByIdOrThrow(taskId);
  const formattedData = models.task.formatTaskChanges(data, originalTask);
  return await models.task.updateById(taskId, formattedData, user.id);
};
