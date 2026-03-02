import { useQuery } from '@tanstack/react-query';
import { SyncFact } from '@tupaia/constants';
import { useDatabaseContext } from '../../hooks/database';

export const useIsLoggedIn = () => {
  const { models } = useDatabaseContext() || {};

  return useQuery<boolean>(['isLoggedIn'], async (): Promise<boolean> => {
    if (models) {
      const currentUserId = await models.localSystemFact.get(SyncFact.CURRENT_USER_ID);
      return !!currentUserId;
    }
    return false;
  });
};
