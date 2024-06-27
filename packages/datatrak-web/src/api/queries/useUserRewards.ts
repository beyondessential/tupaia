/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { DatatrakWebUserRewardsRequest, Project } from '@tupaia/types';
import { get } from '../api';
import { useCurrentUserContext } from '../CurrentUserContext';

const useRewards = (projectId?: Project['id']) => {
  return useQuery(
    ['rewards', projectId],
    (): Promise<DatatrakWebUserRewardsRequest.ResBody> =>
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
