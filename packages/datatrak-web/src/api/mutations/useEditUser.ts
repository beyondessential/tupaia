/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { Project } from '@tupaia/types';
import { put } from '../api';

type ProjectId = { projectId: Project['id'] };

export const useEditUser = onSuccess => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, ProjectId, unknown>(
    async ({ projectId }: ProjectId) => {
      if (!projectId) {
        return;
      }

      await put('me', {
        data: {
          project_id: projectId,
        },
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('getUser');
        onSuccess();
      },
    },
  );
};
