import { useQuery } from '@tanstack/react-query';
import { DatatrakWebLeaderboardRequest, Project } from '@tupaia/types';
import { get } from '../api';

export const useLeaderboard = (projectId?: Project['id']) => {
  return useQuery<DatatrakWebLeaderboardRequest.ResBody>(
    ['leaderboard', projectId],
    async () =>
      await get('leaderboard', {
        params: { projectId },
      }),
    { enabled: window.navigator.onLine && Boolean(projectId) },
  );
};
