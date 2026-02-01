import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { ensure } from '@tupaia/tsutils';
import { SyncFact } from '@tupaia/constants';

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
      console.log('[useLogin] Mutation starting', {
        email,
        isOfflineFirst,
        hasModels: !!models,
      });
      
      let user;
      try {
        if (isOfflineFirst) {
          console.log('[useLogin] Using offline-first auth');
          const authService = new AuthService(ensure(models));
          user = await authService.signIn({ email, password });
          console.log('[useLogin] Auth service signIn complete', { userId: user?.id });
        } else {
          console.log('[useLogin] Using online auth');
          user = await login({ email, password });
        }
      } catch (error: any) {
        console.error('[useLogin] Auth failed', {
          error: error?.message,
          errorStack: error?.stack,
        });
        throw error;
      }

      console.log('[useLogin] Mutation complete', { userId: user?.id });
      return { user };
    },
    {
      onMutate: () => {
        console.log('[useLogin] onMutate');
        gaEvent('login', 'Login', 'Attempt');
      },
      onSuccess: async ({ user }) => {
        console.log('[useLogin] onSuccess starting', { userId: user?.id });
        
        try {
          if (isOfflineFirst) {
            const ensuredModels = ensure(models);
            console.log('[useLogin] Setting up offline-first user data');

            // Clear database if the user has logged in with a different user
            const previouslyLoggedInUserId = await ensuredModels.localSystemFact.get(
              SyncFact.PREVIOUSLY_LOGGED_IN_USER_ID,
            );
            console.log('[useLogin] Previous user check', {
              previouslyLoggedInUserId,
              currentUserId: user.id,
              needsClear: previouslyLoggedInUserId && previouslyLoggedInUserId !== user.id,
            });
            
            if (previouslyLoggedInUserId && previouslyLoggedInUserId !== user.id) {
              console.log('[useLogin] Clearing database for new user');
              await clearDatabase(ensuredModels);
            }

            // Add project for sync if the user has a project
            // if already exists, it will be ignored
            if (user.projectId) {
              console.log('[useLogin] Adding project for sync', { projectId: user.projectId });
              await ensuredModels.localSystemFact.addProjectForSync(user.projectId);
            }

            // Set current user id
            console.log('[useLogin] Setting current user ID');
            await ensuredModels.localSystemFact.set(SyncFact.CURRENT_USER_ID, user.id);
            console.log('[useLogin] Current user ID set');
          }

          console.log('[useLogin] Invalidating queries');
          await queryClient.invalidateQueries();

          // Do not remove the isLoggedIn query,
          // as it is used to determine if the user is logged in and should be kept to be invalidated
          queryClient.removeQueries({
            predicate: query => query.queryKey[0] !== 'isLoggedIn',
          });

          console.log('[useLogin] Navigating', { from, projectId: user.projectId });
          if (from) {
            navigate(from, { state: null });
          } else {
            const path = user.projectId ? ROUTES.HOME : ROUTES.PROJECT_SELECT;
            navigate(path, { state: from });
          }
          console.log('[useLogin] onSuccess complete');
        } catch (error: any) {
          console.error('[useLogin] onSuccess error', {
            error: error?.message,
            errorStack: error?.stack,
          });
          throw error;
        }
      },
      onError: (error: any) => {
        console.error('[useLogin] onError', {
          error: error?.message,
          errorStack: error?.stack,
        });
      },
      meta: {
        applyCustomErrorHandling: true,
      },
    },
  );
};
