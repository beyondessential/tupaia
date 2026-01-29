import { SyncFact } from '@tupaia/constants';
import { useDatabaseContext } from '../../hooks/database';
import { useQuery } from '@tanstack/react-query';

export const useIsLoggedIn = () => {
  const { models } = useDatabaseContext() || {};

  return useQuery<boolean>(['isLoggedIn'], async (): Promise<boolean> => {
    console.log('[useIsLoggedIn] Query executing', {
      hasModels: !!models,
      timestamp: new Date().toISOString(),
    });

    try {
      if (models) {
        const allSystemFacts = await models.localSystemFact.find({});
        const allUsers = await models.user.find({});
        const allProjects = await models.project.find({});
        console.log('[useIsLoggedIn] All system facts', {
          allSystemFacts,
          allUsers,
          allProjects
        });
        const currentUserId = await models.localSystemFact.get(SyncFact.CURRENT_USER_ID);
        console.log('[useIsLoggedIn] Got currentUserId', {
          hasCurrentUserId: !!currentUserId,
          currentUserId,
        });
        return !!currentUserId;
      }
      console.log('[useIsLoggedIn] No models, returning false');
      return false;
    } catch (error: any) {
      console.error('[useIsLoggedIn] Error!', {
        error: error?.message,
        errorStack: error?.stack,
      });
      throw error;
    }
  });
};
