/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useInfiniteQuery } from 'react-query';
import { DatatrakWebActivityFeedRequest, Project } from '@tupaia/types';
import { get } from '../api';
import { useCurrentUser } from '..';

export const useActivityFeed = (projectId?: Project['id']) => {
  return useInfiniteQuery(
    ['activityFeed', projectId],
    ({ pageParam = 0 }): Promise<DatatrakWebActivityFeedRequest.ResBody> =>
      get('activityFeed', {
        params: {
          page: pageParam,
          projectId,
        },
      }),
    {
      getNextPageParam: (data, pages) => {
        if (!data) return 0;
        return data?.hasMorePages ? pages.length : undefined;
      },
      enabled: !!projectId,
    },
  );
};

export const useCurrentProjectActivityFeed = () => {
  const { projectId } = useCurrentUser();
  return useActivityFeed(projectId);
};
