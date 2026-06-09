import type { Project } from '@tupaia/types';
import { useOnlineQuery } from './useOnlineQuery';
import type { UserRewards } from '../../types';
import { useCurrentUserContext } from '../CurrentUserContext';
import { get } from '../api';

const useRewards = (projectId?: Project['id']) => {
  return useOnlineQuery<UserRewards>(
    ['rewards', projectId],
    () =>
      get('me/rewards', {
        params: {
          projectId,
        },
      }),
    {
      enabled: !!projectId,
    },
  );
};

export const useUserRewards = () => {
  const user = useCurrentUserContext();
  return useRewards(user.projectId);
};
