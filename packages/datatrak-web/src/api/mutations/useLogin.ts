import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ensure } from '@tupaia/tsutils';

import { gaEvent, useFromLocation } from '../../utils';
import { ROUTES } from '../../constants';
import { useDatabaseContext } from '../../hooks/database';
import { AuthService } from '../../auth';
import { useIsOfflineFirst } from '../offlineFirst';
import { login } from '../../auth/login';

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
          if (user.projectId) {
            await ensure(models).localSystemFact.addProjectForSync(user.projectId);
          }
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
