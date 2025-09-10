import { ensure } from '@tupaia/tsutils';
import { CreateTaskCommentLocalContext } from '../../api/mutations/useCreateTaskComment';

export const createTaskComment = async ({
  models,
  data,
  user,
  taskId,
}: CreateTaskCommentLocalContext) => {
  const task = await models.task.findById(ensure(taskId));
  await task.addUserComment(data, ensure(user?.id));
};
