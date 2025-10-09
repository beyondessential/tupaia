import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { gaEvent, useFromLocation } from '../../utils';
import { ROUTES } from '../../constants';
import { useDatabaseContext } from '../../hooks/database';
import { useSyncContext } from '../SyncContext';
import { AuthService } from '../../auth';
import { useIsOfflineFirst } from '../offlineFirst';

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
      let user;
      if (isOfflineFirst) {
        user = await authService.signIn({ email, password });
      } else {
        user = await authService.remoteSignIn({ email, password });
      }
      return { user };
    },
    {
      onMutate: () => {
        gaEvent('login', 'Login', 'Attempt');
      },
      onSuccess: async ({ user }) => {
        await queryClient.invalidateQueries();
        await queryClient.removeQueries();

        if (user.preferences?.projectId) {
          await models.localSystemFact.addProjectForSync(user.preferences.projectId);
        }

        await clientSyncManager.triggerSync();

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
