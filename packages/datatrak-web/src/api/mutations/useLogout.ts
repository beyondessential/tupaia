import { useQueryClient } from '@tanstack/react-query';

import { post } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { useDatabaseMutation } from '../queries';

const logoutOnline = async () => {
  return await post('logout');
};

const logoutOffline = async () => {
  await localStorage.removeItem('currentUserEmail');
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const isOfflineFirst = useIsOfflineFirst();

  return useDatabaseMutation(isOfflineFirst ? logoutOffline : logoutOnline, {
    onSuccess: async () => {
      await queryClient.resetQueries();
    },
  });
};
