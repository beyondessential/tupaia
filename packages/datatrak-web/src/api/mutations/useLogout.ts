import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '../api';

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation(['logout'], () => post('logout'), {
    onSuccess: async () => {
      await queryClient.resetQueries();
    },
  });
};
