import { assertIsNotNullish } from '@tupaia/tsutils';
import { CreateTaskCommentLocalContext } from '../../api/mutations/useCreateTaskComment';

export const createTaskComment = async ({
  models,
  data: message,
  user,
  taskId,
}: CreateTaskCommentLocalContext) => {
  assertIsNotNullish(taskId, 'createTaskComment mutation function called with undefined taskId');
  assertIsNotNullish(user?.id, 'createTaskComment mutation function called with undefined user.id');
  return await models.task.addUserComment(message, taskId, user?.id);
};
