/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { Task } from '@tupaia/types';
import { put } from '../api';

type Data = Partial<Task>;

export const useEditTask = (taskId: Task['id'], onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, Data, unknown>(
    (data: Data) => {
      return put(`tasks/${taskId}`, {
        data,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks');
        if (onSuccess) onSuccess();
      },
    },
  );
};
