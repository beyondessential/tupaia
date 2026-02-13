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
  await models.wrapInTransaction(async transactingModels => {
    const currentUserId = await transactingModels.localSystemFact.get(SyncFact.CURRENT_USER_ID);
    if (currentUserId) {
      // currentUserId should always be defined here; this is mostly to satisfy TypeScript
      await transactingModels.localSystemFact.set(
        SyncFact.PREVIOUSLY_LOGGED_IN_USER_ID,
        currentUserId,
      );
    }
    await transactingModels.localSystemFact.delete({ key: SyncFact.CURRENT_USER_ID });
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const isOfflineFirst = useIsOfflineFirst();
  const { clientSyncManager } = useSyncContext() || {};

  return useDatabaseMutation(isOfflineFirst ? logoutOffline : logoutOnline, {
    onSuccess: async () => {
      await Promise.all([clientSyncManager?.stopSyncService(), queryClient.resetQueries()]);
    },
  });
};
