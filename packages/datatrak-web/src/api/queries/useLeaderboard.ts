import type { DatatrakWebLeaderboardRequest, Project } from '@tupaia/types';
import { useOnlineQuery } from './useOnlineQuery';
import { get } from '../api';

export const useLeaderboard = (projectId?: Project['id']) => {
  return useOnlineQuery<DatatrakWebLeaderboardRequest.ResBody>(
    ['leaderboard', projectId],
    async () =>
      await get('leaderboard', {
        params: { projectId },
      }),
    { enabled: Boolean(projectId) },
  );
};
