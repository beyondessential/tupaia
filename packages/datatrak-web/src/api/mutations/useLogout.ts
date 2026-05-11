import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { SyncFact } from '@tupaia/constants';

import { ROUTES } from '../../constants';
import { clearDatabase } from '../../database';
import { useSyncContext } from '../SyncContext';
import { post } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { ContextualMutationFunctionContext, useDatabaseMutation } from '../queries';

export interface LogoutParams {
  /**
   * If true, the local database is wiped on logout regardless of the persisted
   * `PERMISSIONS_CHANGED` fact. Used when the caller already knows the user
   * needs a fresh DB (e.g. the permissions-changed banner) to avoid relying
   * solely on a sync-fact read that may have diverged from the in-memory state
   * the banner is showing.
   */
  resetDatabase?: boolean;
}

const logoutOnline = async (_args: ContextualMutationFunctionContext<LogoutParams>) => {
  return await post('logout');
};

const logoutOffline = async ({
  data,
  models,
}: ContextualMutationFunctionContext<LogoutParams>) => {
  try {
    return await models.wrapInTransaction(async transactingModels => {
      const currentUserId = await transactingModels.localSystemFact.get(SyncFact.CURRENT_USER_ID);
      if (currentUserId) {
        // currentUserId should always be defined here; this is mostly to satisfy TypeScript
        await transactingModels.localSystemFact.set(
          SyncFact.PREVIOUSLY_LOGGED_IN_USER_ID,
          currentUserId,
        );
      }

      await transactingModels.localSystemFact.delete({ key: SyncFact.CURRENT_USER_ID });

      const permissionsDidChange =
        (await transactingModels.localSystemFact.get(SyncFact.PERMISSIONS_CHANGED)) === 'true';

      if (permissionsDidChange || data?.resetDatabase === true) {
        await clearDatabase(transactingModels);
      }

      return { success: true };
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.name === 'KnexTimeoutError') {
      throw new Error(
        'Couldn’t log out, likely because sync was taking a long time. Please wait for sync to finish and try again.',
      );
    }
    throw e;
  }
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const isOfflineFirst = useIsOfflineFirst();
  const { clientSyncManager } = useSyncContext() || {};
  const navigate = useNavigate();

  return useDatabaseMutation<unknown, Error, LogoutParams>(
    isOfflineFirst ? logoutOffline : logoutOnline,
    {
      mutationKey: ['logout'],
      onSuccess: async () => {
        // Immediately refetch user rather than waiting for cache invalidation to trigger refetch in
        // its own time. Having a user cached in the query client will make the ROUTES.LOGIN page
        // redirect back to ROUTES.HOME.
        // @see AuthViewLoggedInRedirect in src/routes/Routes.tsx
        await Promise.all([
          queryClient.refetchQueries({ queryKey: ['getUser'] }),
          queryClient.refetchQueries({ queryKey: ['isLoggedIn'] }),
        ]);
        navigate(ROUTES.LOGIN);

        await Promise.all([
          clientSyncManager?.stopSyncService(),
          queryClient.invalidateQueries({
            predicate: q => {
              const queryKeyHead = q.queryKey?.[0];
              return queryKeyHead !== 'getUser' && queryKeyHead !== 'isLoggedIn';
            },
          }),
        ]);
      },
    },
  );
};
