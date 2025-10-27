import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ensure } from '@tupaia/tsutils';
import { FACT_CURRENT_USER_ID, FACT_PREVIOUSLY_LOGGED_IN_USER_ID } from '@tupaia/constants';

import { gaEvent, useFromLocation } from '../../utils';
import { ROUTES } from '../../constants';
import { useDatabaseContext } from '../../hooks/database';
import { AuthService } from '../../auth';
import { useIsOfflineFirst } from '../offlineFirst';
import { login } from '../../auth/login';
import { clearDatabase } from '../../database';

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
          const ensuredModels = ensure(models);
          
          // Clear database if the user has logged in with a different user
          const previouslyLoggedInUserId = await ensuredModels.localSystemFact.get(FACT_PREVIOUSLY_LOGGED_IN_USER_ID);
          if (previouslyLoggedInUserId && previouslyLoggedInUserId !== user.id) {
            await clearDatabase(ensuredModels);
          }

          // Add project for sync if the user has a project
          // if already exists, it will be ignored
          if (user.projectId) {
            await ensuredModels.localSystemFact.addProjectForSync(user.projectId);
          }

          // Set current user id
          await ensuredModels.localSystemFact.set(FACT_CURRENT_USER_ID, user.id);  
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
