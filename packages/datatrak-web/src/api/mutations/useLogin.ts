import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { SyncFact } from '@tupaia/constants';
import { assertIsNotNullish, ensure } from '@tupaia/tsutils';
import { AuthService } from '../../auth';
import { login } from '../../auth/login';
import { ROUTES } from '../../constants';
import { clearDatabase } from '../../database';
import { useDatabaseContext } from '../../hooks/database';
import { gaEvent, useFromLocation } from '../../utils';
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
          assertIsNotNullish(models, 'useLogin query onSuccess callback fired with nullish models');

          // Clear database if the user has logged in with a different user
          const previouslyLoggedInUserId = await models.localSystemFact.get(
            SyncFact.PREVIOUSLY_LOGGED_IN_USER_ID,
          );

          if (previouslyLoggedInUserId && previouslyLoggedInUserId !== user.id) {
            await clearDatabase(models);
          }

          // Add project for sync if the user has a project
          // if already exists, it will be ignored
          if (user.projectId) {
            await models.localSystemFact.addProjectForSync(user.projectId);
          }

          // Set current user id
          await models.localSystemFact.set(SyncFact.CURRENT_USER_ID, user.id);
        }

        await queryClient.invalidateQueries();

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
