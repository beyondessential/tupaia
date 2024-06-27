/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { useMutation, useQueryClient } from 'react-query';
import { Task } from '@tupaia/types';
import { put } from '../api';

export const useEditTask = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, Task, unknown>(
    async (task: Task) => {
      if (!task) return;

      console.log('task', task);

      const updates = Object.fromEntries(Object.entries(task).map(([key, value]) => [key, value]));

      await put(`tasks/${task.id}`, { data: updates });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks');
        if (onSuccess) onSuccess();
      },
    },
  );
};
