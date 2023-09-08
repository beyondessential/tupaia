/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { Project } from '@tupaia/types';
import { put } from '../api';
import { useUser } from '../queries';

type ProjectId = { projectId: Project['id'] };

export const useEditUser = onSuccess => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return useMutation<any, Error, ProjectId, unknown>(
    async ({ projectId }: ProjectId) => {
      if (!user?.id || !projectId) {
        return;
      }

      await put(`users/${user.id}`, {
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
