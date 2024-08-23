/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { DatatrakWebTaskChangeRequest, Task } from '@tupaia/types';
import { post } from '../api';
import { successToast } from '../../utils';
import { useCurrentUserContext } from '../CurrentUserContext';

export const useCreateTask = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { projectId } = useCurrentUserContext();
  return useMutation<any, Error, DatatrakWebTaskChangeRequest.ReqBody, unknown>(
    (data: DatatrakWebTaskChangeRequest.ReqBody) => {
      return post('tasks', {
        data,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks');
        queryClient.invalidateQueries(['taskMetric', projectId]);
        successToast('Task successfully created');
        if (onSuccess) onSuccess();
      },
    },
  );
};
