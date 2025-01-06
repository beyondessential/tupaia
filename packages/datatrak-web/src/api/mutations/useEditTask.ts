/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Task } from '@tupaia/types';
import { put } from '../api';
import { successToast } from '../../utils';
import { useCurrentUserContext } from '../CurrentUserContext';

type PartialTask = Partial<Task>;

export const useEditTask = (taskId?: Task['id'], onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { projectId } = useCurrentUserContext();
  return useMutation<any, Error, PartialTask, unknown>(
    (task: PartialTask) => {
      return put(`tasks/${taskId}`, {
        data: task,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tasks']);
        queryClient.invalidateQueries(['tasks', taskId]);
        queryClient.invalidateQueries(['taskMetric', projectId]);
        successToast('Task updated successfully');
        if (onSuccess) onSuccess();
      },
    },
  );
};
