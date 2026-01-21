import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { SyncFact } from '@tupaia/constants';
import { ensure } from '@tupaia/tsutils';
import { AuthService } from '../../auth';
import { login } from '../../auth/login';
import { ROUTES } from '../../constants';
import { clearDatabase } from '../../database';
import { useDatabaseContext } from '../../hooks/database';
import { gaEvent, useFromLocation } from '../../utils';
import { useSyncContext } from '../SyncContext';
import { useIsOfflineFirst } from '../offlineFirst';

type LoginCredentials = {
  email: string;
  password: string;
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const from = useFromLocation();
  const { models } = useDatabaseContext() || {};
  const { clientSyncManager } = useSyncContext() || {};
  const isOfflineFirst = useIsOfflineFirst();

  return useMutation<any, Error, LoginCredentials, unknown>(
    async ({ email, password }: LoginCredentials) => {
      let user;
      if (isOfflineFirst) {
        const authService = new AuthService(ensure(models));
        user = await authService.signIn({ email, password });
      } else {
        user = await login({ email, password });
      }

      return { user };
    },
    {
      onMutate: () => {
        gaEvent('login', 'Login', 'Attempt');
      },
      onSuccess: async ({ user }) => {
        if (isOfflineFirst) {
          const ensuredModels = ensure(models);
          const syncManager = ensure(clientSyncManager);

          // Clear database if the user has logged in with a different user
          const previouslyLoggedInUserId = await ensuredModels.localSystemFact.get(
            SyncFact.PREVIOUSLY_LOGGED_IN_USER_ID,
          );
          if (previouslyLoggedInUserId && previouslyLoggedInUserId !== user.id) {
            await clearDatabase(ensuredModels);
          }

          // Add project for sync if the user has a project
          // if already exists, it will be ignored
          if (user.projectId) {
            await ensuredModels.localSystemFact.addProjectForSync(user.projectId);
          }

          // Set current user id
          await ensuredModels.localSystemFact.set(SyncFact.CURRENT_USER_ID, user.id);

          // Emit permissions changed event to reset data notification
          await syncManager.updatePermissionsChanged(false);
        }

        await queryClient.invalidateQueries();

        // Do not remove the isLoggedIn query,
        // as it is used to determine if the user is logged in and should be kept to be invalidated
        queryClient.removeQueries({
          predicate: query => query.queryKey[0] !== 'isLoggedIn',
        });

        if (from) {
          navigate(from, { state: null });
        } else {
          const path = user.projectId ? ROUTES.HOME : ROUTES.PROJECT_SELECT;
          navigate(path, { state: from });
        }
      },
      meta: {
        applyCustomErrorHandling: true,
      },
    },
  );
};
