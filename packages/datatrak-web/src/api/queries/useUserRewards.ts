import { useQuery } from '@tanstack/react-query';
import { Project } from '@tupaia/types';
import { get } from '../api';
import { UserRewards } from '../../types';
import { useCurrentUserContext } from '../CurrentUserContext';

const useRewards = (projectId?: Project['id']) => {
  return useQuery<UserRewards>(
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
