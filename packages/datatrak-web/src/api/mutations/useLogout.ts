import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '../api';
import { useDatabaseContext } from '../../hooks/database';
import { clearDatabase } from '../../database';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { models } = useDatabaseContext();

  return useMutation(['logout'], () => post('logout'), {
    onSuccess: async () => {
      await queryClient.resetQueries();

      await clearDatabase(models);
    },
  });
};
