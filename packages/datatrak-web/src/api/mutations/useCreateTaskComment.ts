import { useQueryClient } from '@tanstack/react-query';
import { Task, TaskCommentType } from '@tupaia/types';

import { post } from '../api';
import { successToast } from '../../utils';
import { useDatabaseMutation } from '../queries';
import { useIsOfflineFirst } from '../offlineFirst';
import { createTaskComment } from '../../database';
import { DatatrakWebModelRegistry } from '../../types';
import { CurrentUser } from '../CurrentUserContext';

export interface CreateTaskCommentLocalContext {
  models: DatatrakWebModelRegistry;
  user?: CurrentUser;
  data: string;
  taskId?: Task['id'];
}

const createTaskCommentOnline = ({ taskId, data }: CreateTaskCommentLocalContext) =>
  post(`tasks/${taskId}/taskComments`, {
    data: {
      message: data,
      type: TaskCommentType.user,
    },
  });

export const useCreateTaskComment = (taskId?: Task['id'], onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const isOfflineFirst = useIsOfflineFirst();
  return useDatabaseMutation<void, Error, string, unknown>(
    isOfflineFirst ? createTaskComment : createTaskCommentOnline,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks']);
        queryClient.invalidateQueries(['tasks', taskId]);
        successToast('Comment added successfully');
        if (onSuccess) {
          onSuccess();
        }
      },
      localContext: {
        taskId,
      },
    },
  );
};
