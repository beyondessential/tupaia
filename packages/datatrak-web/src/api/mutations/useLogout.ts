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
    await transactingModels.database.executeSql(
      `
        UPDATE local_system_fact
        SET value = (SELECT value FROM local_system_fact WHERE key = ?)
        WHERE key = ?
      `,
      [SyncFact.CURRENT_USER_ID, SyncFact.PREVIOUSLY_LOGGED_IN_USER_ID],
    );
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
      // Immediately update query cache, otherwise navigating to ROUTES.LOGIN may cause unexpected
      // redirects (even if we were to await invalidateQueries() first).
      // @see `src/routes/Routes.tsx`
      queryClient.setQueryData(['getUser'], {});
      navigate(ROUTES.LOGIN);

      await Promise.all([clientSyncManager?.stopSyncService(), queryClient.refetchQueries()]);
    },
  });
};
