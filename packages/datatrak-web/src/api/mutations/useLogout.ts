import { useQueryClient } from '@tanstack/react-query';

import { FACT_CURRENT_USER_ID, FACT_PREVIOUSLY_LOGGED_IN_USER_ID } from '@tupaia/constants';

import { post } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { useDatabaseMutation } from '../queries';
import { DatatrakWebModelRegistry } from '../../types';

const logoutOnline = async () => {
  return await post('logout');
};

const logoutOffline = async ({ models }: { models: DatatrakWebModelRegistry }) => {
  const currentUserId = await models.localSystemFact.get(FACT_CURRENT_USER_ID);
  await models.localSystemFact.set(FACT_PREVIOUSLY_LOGGED_IN_USER_ID, currentUserId);
  await models.localSystemFact.delete({ key: FACT_CURRENT_USER_ID });
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
