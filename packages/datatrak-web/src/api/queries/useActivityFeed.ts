import { useInfiniteQuery } from '@tanstack/react-query';
import { DatatrakWebActivityFeedRequest, Project } from '@tupaia/types';
import { get } from '../api';
import { useCurrentUserContext } from '..';

interface UseActivityFeedProps {
  projectId?: Project['id'];
  pageLimit?: number;
}

export const useActivityFeed = ({ projectId, pageLimit }: UseActivityFeedProps) => {
  return useInfiniteQuery<DatatrakWebActivityFeedRequest.ResBody>(
    ['activityFeed', projectId, pageLimit],
    async ({ pageParam = 0 }) => {
      const params = {
        page: pageParam,
        projectId,
        pageLimit,
      };
      return await get('activityFeed', { params });
    },
    {
      getNextPageParam: (data, pages) => {
        if (!data) return 0;
        return data?.hasMorePages ? pages.length : undefined;
      },
      enabled: window.navigator.onLine && Boolean(projectId),
    },
  );
};

export const useCurrentProjectActivityFeed = (pageLimit?: number) => {
  const { projectId } = useCurrentUserContext();
  return useActivityFeed({ projectId, pageLimit });
};
