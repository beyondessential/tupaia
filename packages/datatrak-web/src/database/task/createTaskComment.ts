import { CreateTaskCommentLocalContext } from '../../api/mutations/useCreateTaskComment';

export const createTaskComment = async ({
  models,
  data: message,
  user,
  taskId,
}: CreateTaskCommentLocalContext) => {
  return await models.task.addUserComment(message, taskId, user?.id);
};
