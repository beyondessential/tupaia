import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { FACT_CURRENT_USER_ID, FACT_PREVIOUSLY_LOGGED_IN_USER_ID } from '@tupaia/constants';

import { gaEvent, useFromLocation } from '../../utils';
import { ROUTES } from '../../constants';
import { useDatabaseContext } from '../../hooks/database';
import { useSyncContext } from '../SyncContext';
import { AuthService } from '../../auth';
import { useIsOfflineFirst } from '../offlineFirst';
import { clearDatabase } from '../../database';

type LoginCredentials = {
  email: string;
  password: string;
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const from = useFromLocation();
  const { models } = useDatabaseContext();
  const { clientSyncManager } = useSyncContext();
  const isOfflineFirst = useIsOfflineFirst();

  return useMutation<any, Error, LoginCredentials, unknown>(
    async ({ email, password }: LoginCredentials) => {
      const authService = new AuthService(models);
      const user = await (isOfflineFirst
        ? authService.signIn({ email, password })
        : authService.remoteSignIn({ email, password }));

      return { user };
    },
    {
      onMutate: () => {
        gaEvent('login', 'Login', 'Attempt');
      },
      onSuccess: async ({ user }) => {
        if (isOfflineFirst) {
          const previouslyLoggedInUserId = await models.localSystemFact.get(FACT_PREVIOUSLY_LOGGED_IN_USER_ID);
          if (previouslyLoggedInUserId && previouslyLoggedInUserId !== user.id) {
            await clearDatabase(models);
          }

          if (user.preferences?.projectId) {
            await models.localSystemFact.addProjectForSync(user.preferences.projectId);
          }      
  
          await models.localSystemFact.set(FACT_CURRENT_USER_ID, user.id);
  
          await clientSyncManager.triggerSync();
        }

        await queryClient.invalidateQueries();
        await queryClient.removeQueries();

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
