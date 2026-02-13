import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { SyncFact } from '@tupaia/constants';
import { ROUTES } from '../../constants';
import { DatatrakWebModelRegistry } from '../../types';
import { useSyncContext } from '../SyncContext';
import { post } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { useDatabaseMutation } from '../queries';

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
  const navigate = useNavigate();

  return useDatabaseMutation(isOfflineFirst ? logoutOffline : logoutOnline, {
    onSuccess: async () => {
      () => navigate(ROUTES.LOGIN);
      await Promise.all([clientSyncManager?.stopSyncService(), queryClient.resetQueries()]);
    },
  });
};
