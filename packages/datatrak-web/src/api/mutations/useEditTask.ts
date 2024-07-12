/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { Task } from '@tupaia/types';
import { put } from '../api';

type PartialTask = Partial<Task>;

export const useEditTask = (taskId?: Task['id'], onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, PartialTask, unknown>(
    (task: PartialTask) => {
      return put(`tasks/${taskId}`, {
        data: task,
      });
    },
    {
      onSuccess: () => {
        if (onSuccess) onSuccess();
        queryClient.invalidateQueries('tasks');
      },
    },
  );
};
