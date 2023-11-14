/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { Project } from '@tupaia/types';
import { get } from '../api';
import { UserRewards } from '../../types';
import { useCurrentUser } from '../CurrentUserContext.tsx';

const useRewards = (projectId?: Project['id']) => {
  return useQuery(
    ['rewards', projectId],
    (): Promise<UserRewards> =>
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
  const user = useCurrentUser();
  return useRewards(user.projectId);
};
