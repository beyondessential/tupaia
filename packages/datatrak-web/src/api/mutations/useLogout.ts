import { useQueryClient } from '@tanstack/react-query';

import { SyncFact } from '@tupaia/constants';

import { post } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { useDatabaseMutation } from '../queries';
import { DatatrakWebModelRegistry } from '../../types';
import { useSyncContext } from '../SyncContext';

const logoutOnline = async () => {
  return await post('logout');
};

const logoutOffline = async ({ models }: { models: DatatrakWebModelRegistry }) => {
  const currentUserId = await models.localSystemFact.get(SyncFact.CURRENT_USER_ID);
  await models.localSystemFact.set(SyncFact.PREVIOUSLY_LOGGED_IN_USER_ID, currentUserId);
  await models.localSystemFact.delete({ key: SyncFact.CURRENT_USER_ID });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const isOfflineFirst = useIsOfflineFirst();
  const { clientSyncManager } = useSyncContext() || {};

  return useDatabaseMutation(isOfflineFirst ? logoutOffline : logoutOnline, {
    onSuccess: () => {
      if (isOfflineFirst && clientSyncManager) {
        clientSyncManager.stopSyncService();
      }
      queryClient.resetQueries();
    },
  });
};
