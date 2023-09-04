/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { put } from '../api';
import { useUser } from '../queries';
import { ROUTES } from '../../constants';

type ProjectId = {
  projectId: string;
};
export const useEditUser = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
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
        navigate(ROUTES.HOME);
      },
    },
  );
};
