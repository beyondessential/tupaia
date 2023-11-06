/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useInfiniteQuery } from 'react-query';
import { get } from '../api';
import { ActivityFeedResponse } from '../../types';

export const useActivityFeed = () => {
  return useInfiniteQuery(
    ['activityFeed'],
    ({ pageParam = 0 }): Promise<ActivityFeedResponse> =>
      get('socialFeed', {
        params: {
          page: pageParam,
        },
      }),
    {
      getNextPageParam: (data, pages) => (data?.hasMorePages ? pages.length : null),
    },
  );
};
