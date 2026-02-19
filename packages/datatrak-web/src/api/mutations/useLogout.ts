import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { SyncFact } from '@tupaia/constants';
import { ROUTES } from '../../constants';
import { clearDatabase } from '../../database';
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

    const permissionsDidChange =
      (await transactingModels.localSystemFact.get(SyncFact.PERMISSIONS_CHANGED)) === 'true';
    if (permissionsDidChange) {
      await clearDatabase(transactingModels);
    }
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const isOfflineFirst = useIsOfflineFirst();
  const { clientSyncManager } = useSyncContext() || {};
  const navigate = useNavigate();

  return useDatabaseMutation(isOfflineFirst ? logoutOffline : logoutOnline, {
    onSuccess: async () => {
      // Immediately refetch user rather than waiting for cache invalidation to trigger refetch in
      // its own time. Having a user cached in the query client will make the ROUTES.LOGIN page
      // redirect back to ROUTES.HOME.
      // @see AuthViewLoggedInRedirect in src/routes/Routes.tsx
      await queryClient.refetchQueries({ queryKey: ['getUser'] });
      navigate(ROUTES.LOGIN);

      await Promise.all([clientSyncManager?.stopSyncService(), queryClient.refetchQueries()]);
    },
  });
};
