/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { DatatrakWebCreateTaskRequest } from '@tupaia/types';
import { post } from '../api';

export const useCreateTask = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, DatatrakWebCreateTaskRequest.ReqBody, unknown>(
    (data: DatatrakWebCreateTaskRequest.ReqBody) => {
      return post('tasks', {
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
