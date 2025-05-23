import { useQuery } from '@tanstack/react-query';
import { DatatrakWebLeaderboardRequest, Project } from '@tupaia/types';
import { get } from '../api';

export const useLeaderboard = (projectId?: Project['id']) => {
  return useQuery(
    ['leaderboard', projectId],
    (): Promise<DatatrakWebLeaderboardRequest.ResBody> =>
      get('leaderboard', {
        params: {
          projectId,
        },
      }),
  );
};
