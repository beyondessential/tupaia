/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { DatatrakWebActivityFeedRequest, Project } from '@tupaia/types';
import { get } from '../api';
import { useCurrentUserContext } from '..';

interface UseActivityFeedProps {
  projectId?: Project['id'];
  pageLimit?: number;
}

export const useActivityFeed = ({ projectId, pageLimit }: UseActivityFeedProps) => {
  return useInfiniteQuery(
    ['activityFeed', projectId, pageLimit],
    ({ pageParam = 0 }): Promise<DatatrakWebActivityFeedRequest.ResBody> => {
      const params = {
        page: pageParam,
        projectId,
        pageLimit,
      };
      if (pageLimit) {
        params.pageLimit = pageLimit;
      }
      return get('activityFeed', {
        params,
      });
    },
    {
      getNextPageParam: (data, pages) => {
        if (!data) return 0;
        return data?.hasMorePages ? pages.length : undefined;
      },
      enabled: !!projectId,
    },
  );
};

export const useCurrentProjectActivityFeed = (pageLimit?: number) => {
  const { projectId } = useCurrentUserContext();
  return useActivityFeed({ projectId, pageLimit });
};
