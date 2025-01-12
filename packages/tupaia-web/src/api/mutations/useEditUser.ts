import { useMutation, useQueryClient } from '@tanstack/react-query';
import { put } from '../api';

type UserAccountDetails = Record<string, any>;

export const useEditUser = (onSuccess?: (data: UserAccountDetails) => void) => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, UserAccountDetails, unknown>(
    async ({ projectId }: Record<string, any>) => {
      const data = {
        project_id: projectId,
      };
      await put('me', { data });
      return {
        projectId,
      };
    },
    {
      onSuccess: data => {
        queryClient.invalidateQueries(['getUser']);
        if (onSuccess) onSuccess(data);
      },
    },
  );
};
