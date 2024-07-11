/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { useMutation, useQueryClient } from 'react-query';
import { Task } from '../../types';
import { put } from '../api';

type PartialTask = Partial<Task>;

export const useEditTask = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, PartialTask, unknown>(
    async (task: PartialTask) => {
      if (!task) return;
      await put(`tasks/${task.id}`, { data: task });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks');
        if (onSuccess) onSuccess();
      },
    },
  );
};
