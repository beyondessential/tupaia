import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, TaskCommentType } from '@tupaia/types';
import { post } from '../api';
import { successToast } from '../../utils';

export const useCreateTaskComment = (taskId?: Task['id'], onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string, unknown>(
    (comment: string) => {
      return post(`tasks/${taskId}/taskComments`, {
        data: {
          message: comment,
          type: TaskCommentType.user,
        },
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks']);
        queryClient.invalidateQueries(['tasks', taskId]);
        successToast('Comment added successfully');
        if (onSuccess) {
          onSuccess();
        }
      },
    },
  );
};
