/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { put } from '../api';
import { useUser } from '../queries';

type ProjectId = {
  projectId: string;
};
export const useEditUser = () => {
  // const queryClient = useQueryClient();
  const { data: user } = useUser();
  console.log('user', user);

  return useMutation<any, Error, ProjectId, unknown>(
    ({ projectId }: ProjectId) => {
      console.log('projectId', projectId);
      if (!user?.id || !projectId) {
        return;
      }

      return put(`users/${user.id}`, {
        data: {
          project_id: projectId,
          position: 'Updated position 123',
        },
      });
    },
    {
      onSuccess: () => {
        console.log('success');
      },
    },
  );
};
